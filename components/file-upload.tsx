import { UploadIcon, XIcon } from 'lucide-react';
import { useRef } from 'react';

interface FileUploadProps {
    files: File[];
    onChange: (files: File[]) => void;
}

export function FileUpload({ files, onChange }: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);
        onChange([...files, ...selected]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeFile = (index: number) => {
        onChange(files.filter((_, i) => i !== index));
    };

    return (
        <div className="rounded-md border p-4 space-y-3">
            <p className="text-sm font-medium">Attachments</p>
            <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/30 p-6 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
            >
                <UploadIcon className="h-5 w-5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground text-center">
                    Click to upload supporting documents
                </p>
            </div>
            <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
            />
            {files.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-xs">
                            <span className="truncate max-w-35">{file.name}</span>
                            <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="ml-2 text-muted-foreground hover:text-red-500 transition-colors"
                            >
                                <XIcon className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}