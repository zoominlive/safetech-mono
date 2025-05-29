import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import React from "react";
import { getProfilePictureUrl } from "@/utils/profilePicture";

interface ImagePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imagePreview?: string | null;
  profile_picture?: string | null;
  uploadingImage: boolean;
  onRemove: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  open,
  onOpenChange,
  imagePreview,
  profile_picture,
  uploadingImage,
  onRemove,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-xs w-full flex flex-col items-center">
      <DialogHeader>
        <DialogTitle>Profile Picture</DialogTitle>
      </DialogHeader>
      <img
        src={getProfilePictureUrl({ imagePreview, profile_picture })}
        alt="Profile Preview"
        className="rounded-full w-40 h-40 object-cover border mb-4"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "/user/avatar-sf.png";
        }}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
      />
      <DialogFooter className="w-full !flex !flex-col gap-2 items-stretch">
        <Button
          variant="destructive"
          className="w-full"
          onClick={onRemove}
          disabled={uploadingImage}
        >
          {uploadingImage ? "Removing..." : "Remove Picture"}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onOpenChange(false)}
        >
          Close <X className="ml-2 h-4 w-4" />
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
