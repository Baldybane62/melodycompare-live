
import React, { useState, useCallback } from 'react';
import { CloudArrowUpIcon, MusicNoteIcon } from './icons';

interface FileUploadProps {
    onFileSelect: (file: File | null) => void;
    acceptedFormats: string;
    label: string;
    compact?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, acceptedFormats, label, compact = false }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFile = (file: File) => {
        if (file && acceptedFormats.includes(file.type)) {
            setFileName(file.name);
            onFileSelect(file);
            setError(null);
        } else {
            setFileName(null);
            onFileSelect(null);
            setError(`Invalid file type. Please upload ${acceptedFormats.replace(/audio\//g, '')}.`);
        }
    };

    const onDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };
    const onDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };
    const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };
    
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    };

    const containerClasses = `w-full relative border-2 border-dashed rounded-lg flex flex-col justify-center items-center cursor-pointer transition-colors duration-300
        ${compact ? 'p-4' : 'p-8'} 
        ${isDragOver ? 'border-fuchsia-500 bg-fuchsia-500/10' : 'border-slate-600 hover:border-slate-500'}
        ${fileName ? 'border-green-500 bg-green-500/10' : ''}
        ${error ? 'border-red-500 bg-red-500/10' : ''}`;

    return (
        <label
            className={containerClasses}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
            htmlFor={`file-upload-${label.replace(/\s+/g, '-')}`}
        >
            <input 
                id={`file-upload-${label.replace(/\s+/g, '-')}`} 
                name="file-upload" 
                type="file" 
                className="sr-only" 
                accept={acceptedFormats}
                onChange={onFileChange}
            />
            {fileName ? (
                <div className="text-center">
                    <MusicNoteIcon className={`mx-auto text-green-400 ${compact ? 'w-8 h-8' : 'w-12 h-12'}`} />
                    <p className={`font-semibold mt-2 text-green-300 ${compact ? 'text-sm' : 'text-base'}`}>File Selected</p>
                    <p className={`text-xs text-slate-400 truncate max-w-[200px] mt-1`}>{fileName}</p>
                </div>
            ) : (
                <div className="text-center">
                    <CloudArrowUpIcon className={`mx-auto text-slate-500 ${compact ? 'w-8 h-8' : 'w-12 h-12'}`} />
                    <p className={`font-semibold mt-2 text-slate-400 ${compact ? 'text-sm' : 'text-base'}`}>{label}</p>
                    <p className="text-xs text-slate-500">or click to browse</p>
                </div>
            )}
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </label>
    );
};

export default FileUpload;
