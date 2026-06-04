import { uploadDocument } from "@/api/chat";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

function UploadDocumentModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);

  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    setFiles(selected);
  };

  const resetState = () => {
    setFiles([]);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      await Promise.all(files.map((file) => uploadMutation.mutateAsync(file)));

      toast.success("Documents uploaded successfully");

      resetState();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Some uploads failed");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetState();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Upload Knowledge Base Documents</DialogTitle>
          <DialogDescription>
            Upload PDF, TXT, DOCX and other files to enhance AI search.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fileInput" className="text-right">
              Select Files
            </Label>

            <div className="col-span-3">
              <Input
                id="fileInput"
                type="file"
                multiple
                onChange={handleFileChange}
                className="cursor-pointer py-2"
              />

              {files.length > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Selected files:</p>
                  <ul className="list-disc list-inside">
                    {files.map((file) => (
                      <li key={file.name}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload & Process"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UploadDocumentModal;
