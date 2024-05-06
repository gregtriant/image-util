import { readdirSync, readFileSync, copyFileSync, writeFileSync, statSync, existsSync, mkdirSync, unlinkSync, renameSync, rmdirSync } from 'fs';
import path, { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backup_dir = join(__dirname, '..', 'public', 'backups', '/'); // dir with .json backups
const dir_json = join(__dirname, '..', 'public', 'current_json_dics', '/'); // dir with .json files
const ffmpeg_path = join(__dirname, '..', 'ffmpeg', 'bin', 'ffmpeg.exe'); 

export function readFiles(dir, file_ext) {
    try {
        // console.log('Reading files @' + dir);
        let files_to_return = [];
        const files = readdirSync(dir);
        for (let i = 0; i < files.length; i++) {
            // console.log('reading file:', files[i]);
            const ext = extname(files[i]);
            if (ext === file_ext || ext === file_ext.toUpperCase() || file_ext === ".*") {
                const file = {
                    name: files[i],
                    size: getFileSize(dir, files[i])
                }
                files_to_return.push(file);
            }
        }
        return files_to_return;
    } catch (err) {
        console.log(err);
    }
}

export function readImagesAndVideos(dir) {
    try {
        const images1 = readFiles(dir, ".jpg");
        const images2 = readFiles(dir, ".png");
        const videos = readFiles(dir, ".mp4");
        return {
            images: images1.concat(images2),
            videos
        }
    } catch (e) {
        console.log(e);
        return false;
    }
}

export function getFileSize(dir, filename) {
    var stats = statSync(join(dir, filename));
    var fileSizeInBytes = stats.size;
    // Convert the file size to megabytes (optional)
    var fileSizeInMegabytes = fileSizeInBytes / (1024*1024);
    return fileSizeInMegabytes;
}

export function compressFiles(dir, files) {
    const {images, videos} = files;
    try {
        
        for (const image of images) {
            console.log(image.name);
            compressFile(dir, image.name);
        }

        const res = readImagesAndVideos(compressedFolderPath);
        return res;
    } catch (e) {
        console.log(e);
        return false;
    }

}

export function compressFile(dir, outputDir, filename) {
    console.log("Compressing...");
    console.log(dir);
    console.log(outputDir);
    console.log(filename);
    try {

        const compressedFolderPath = outputDir;
        if (!existsSync(compressedFolderPath)) {
            mkdirSync(compressedFolderPath);
        }
        
        const inputFilePath = join(dir, filename);
        const outputFilePath = join(compressedFolderPath, filename);
        if (existsSync(outputFilePath)) {
            unlinkSync(outputFilePath);
            console.log(`Deleted previous output file: ${outputFilePath}`);
        }
        const ffmpegCommand = `${ffmpeg_path} -i "${inputFilePath}" -compression_level 20 "${outputFilePath}"`;
        const output = execSync(ffmpegCommand).toString(); // Convert buffer to string
        console.log(`Output of ffmpeg command for ${filename}:`, output);
        console.log(`Image ${filename} compressed successfully!`);
        return true;
    } catch (error) {
        console.error(`Error compressing ${filename}: ${error.message}`);
        return false;
    }
}

export function replaceOriginalsWithCompressed(dir) {
    try {
        // check if compressed folder exists!
        const compressedFolderPath = join(dir, 'compressed');
        if (!existsSync(compressedFolderPath)) {
            return false;
        }
        
        const originals = readFiles(dir, ".jpg");
        const compressed = readFiles(compressedFolderPath, ".jpg");

        console.log(originals);
        console.log(compressed);
        // move compressed to dir
        for (const compressedImage of compressed) {
            renameSync(join(compressedFolderPath, compressedImage.name), join(dir, compressedImage.name));
        }
        // delete original photos
        for (const image of originals) {
            unlinkSync(join(dir, image.name));
        }
        // delete compressed folder
        rmdirSync(compressedFolderPath, {recursive: true});
        return true;
    } catch (error) {
        console.error(`Error replacing originals with compressed`);
        return false;
    }
}

export function copyRestToOutput(inputDir, outputDir) {
    try {
        console.log("-------------------", inputDir, outputDir)
        // move files that are not images to output
        const originalFiles = readFiles(inputDir, ".*");
        console.log(originalFiles);
        for (const file of originalFiles) {
            const ext = extname(file.name);
            if (ext !== ".jpg" && ext !== ".JPG") {
                copyFileSync(join(inputDir, file.name), join(outputDir, file.name));
            }
        }
        
        return true;
    } catch (error) {
        console.error(`Error replacing originals with compressed`);
        console.log(error);
        return false;
    }
}