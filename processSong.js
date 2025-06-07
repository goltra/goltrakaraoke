const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const {nextSong, readList, update} = require('./fileshandler');
const {exec} = require('child_process'); // Para yt-dlp search
const YTDlpWrap = require('yt-dlp-wrap').default;
const ffmpeg = require('fluent-ffmpeg');
const router = require("./router");
const {ProcessStatusSong} = require("./constants");

const downloadsDir = path.join(__dirname, 'downloads');
const tempDir = path.join(__dirname, 'temp');

const ytDlpWrap = new YTDlpWrap();

async function processVideo(documento) {
    console.time("processVideo");
    const youtubeVideoId = documento.id;
    const semitonesNum = documento.semitones && !isNaN(documento.semitones) ? parseInt(documento.semitones) : 0;
    const singerName = documento.singer;
    const songTitle = documento.title;

    await changeStatusProcessSong(documento, ProcessStatusSong.Processing); //cambio el status a processing

    const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`;
    const videoFilePrefix = `${youtubeVideoId}`;

    const originalAudioPath = path.join(tempDir, `${videoFilePrefix}_original_audio.m4a`);
    const shiftedAudioPath = path.join(tempDir, `${videoFilePrefix}_shifted_audio.m4a`);
    const tempVideoPath = path.join(tempDir, `${videoFilePrefix}_temp_video.mp4`);
    const finalVideoFilename = documento.filename;
    const finalVideoPath = path.join(downloadsDir, finalVideoFilename);
    const finalVideoUrl = `/downloads/${finalVideoFilename}`;
    const cookiesFilePath = path.join(__dirname, 'cookies.txt');
    console.log(`[PROCESS_VIDEO] For: ${singerName} - ${songTitle}, URL: ${youtubeUrl}, Pitch: ${semitonesNum}`);
    try {
        await Promise.all([
            new Promise((resolve, reject) => ytDlpWrap.exec([youtubeUrl, '-f', 'bestaudio[ext=m4a]/bestaudio', '-o', originalAudioPath, '--no-playlist', '--socket-timeout', '15', '--cookies', cookiesFilePath]).on('close', resolve).on('error', (err) => reject(new Error(`Audio DL: ${err.message}`)))),
            new Promise((resolve, reject) => ytDlpWrap.exec([youtubeUrl, '-f', 'bestvideo[ext=mp4]/bestvideo', '--no-audio', '-o', tempVideoPath, '--no-playlist', '--socket-timeout', '15', '--cookies', cookiesFilePath]).on('close', resolve).on('error', (err) => reject(new Error(`Video DL: ${err.message}`))))
        ]);


        const pitchFactor = Math.pow(2, semitonesNum / 12);
        const targetSampleRate = Math.round(44100 * pitchFactor);
        const audioFilters = [`asetrate=${targetSampleRate}`, 'aresample=44100'];
        if (semitonesNum !== 0 && Math.abs(pitchFactor - 1) > 0.001) {
            let atempoFactor = 1 / pitchFactor;
            atempoFactor = Math.max(0.5, Math.min(100, atempoFactor));
            audioFilters.push(`atempo=${atempoFactor.toFixed(4)}`);
        }
        await new Promise((resolve, reject) => {
            ffmpeg(originalAudioPath).audioFilter(audioFilters).outputOptions('-strict -2')
                .on('end', resolve).on('error', (err) => reject(new Error(`FFmpeg Pitch: ${err.message}`)))
                .save(shiftedAudioPath);
        });

        await new Promise((resolve, reject) => {
            ffmpeg().input(tempVideoPath).input(shiftedAudioPath)
                .outputOptions(['-map 0:v:0?', '-map 1:a:0', '-c:v libx264',
                    '-preset veryfast',
                    '-crf 23', '-c:a copy', '-strict -2', '-shortest'])
                .on('end', resolve).on('error', (err) => reject(new Error(`FFmpeg Mux: ${err.message}`)))
                .save(finalVideoPath);
        });
        [originalAudioPath, shiftedAudioPath, tempVideoPath].forEach(fp => {
            try {
                if (fs.existsSync(fp)) fs.unlinkSync(fp);
            } catch (e) {
                console.warn("Error deleting temp file:", e.message);
            }
        });
        console.log(`[PROCESS_VIDEO] Success: ${finalVideoUrl}`);
        await changeStatusProcessSong(documento, ProcessStatusSong.Processed);
        console.timeEnd("processVideo");
        return {processedVideoUrl: finalVideoUrl};
    } catch (error) {
        console.error(`[PROCESS_VIDEO] Error for ${youtubeUrl}:`, error);
        await changeStatusProcessSong(documento, ProcessStatusSong.Failed);
        [originalAudioPath, shiftedAudioPath, tempVideoPath, finalVideoPath].forEach(fp => {
            try {
                if (fs.existsSync(fp)) fs.unlinkSync(fp);
            } catch (e) {
                console.warn("Error deleting temp file during error:", e.message);
            }
        });
        throw error;
    }
}

async function changeStatusProcessSong(documento, status) {
    documento.status = status;
    update(documento);
}

async function nextSongToProcess() {
    const next = await nextSong(ProcessStatusSong.Unprocessed);
    if (!next) {
        console.log('[PROCESS_VIDEO]: No hay videos para procesar.')
        setTimeout(async () => await nextSongToProcess(), 5000);
        return;
    }

    const isUnprocessed = next.status === ProcessStatusSong.Unprocessed;

    if (isUnprocessed) {
        try {
            console.log('[PROCESS_VIDEO]: Compruebo si el video existe en el directorio. ');
            await fsPromises.access(`${downloadsDir}/${next.id}_${next.semitones}.mp4`, fs.constants.F_OK);
            console.log('[PROCESS_VIDEO]: El video existe, no hago nada. ');

            // si está en la lista, le pongo el status a processed
            next.status = ProcessStatusSong.Processed;
            await update(next);
        } catch (err) {
            console.log('[PROCESS_VIDEO]: el fichero no existe en el directorio y procedo a procesarlo.', err)
            await processVideo(next);
        }
    }
    console.log('[PROCESS_VIDEO]: termino de procesar el video');
    setTimeout(async () => await nextSongToProcess(), 5000);
}

module.exports = {nextSongToProcess};
