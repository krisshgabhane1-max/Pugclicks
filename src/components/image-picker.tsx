import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Link2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/**
 * Pick a picture: upload one from the device (gallery / files) or paste an
 * image link. Returns the final URL through onChange.
 */
export function ImagePicker({
  value,
  onChange,
  label = "Image",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState("");

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("site-images")
        .upload(path, file, { cacheControl: "31536000", upsert: false });
      if (error) throw new Error(error.message);

      const { data, error: signError } = await supabase.storage
        .from("site-images")
        .createSignedUrl(path, TEN_YEARS);
      if (signError || !data) throw new Error(signError?.message ?? "Could not link the image");

      onChange(data.signedUrl);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-3">
      <span className="text-sm font-medium">{label}</span>

      {value ? (
        <div className="relative w-full max-w-sm overflow-hidden rounded-xl border border-border">
          <img src={value} alt="Selected" className="aspect-video w-full object-cover" />
          <Button
            size="icon"
            variant="secondary"
            className="absolute right-2 top-2 h-8 w-8"
            aria-label="Remove image"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No image yet — upload one or paste a link.
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" disabled={busy} onClick={() => inputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          {busy ? "Uploading…" : "Upload from device"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          value={link}
          placeholder="…or paste an image link (https://)"
          onChange={(e) => setLink(e.target.value)}
          className="max-w-sm bg-secondary"
          aria-label="Image link"
        />
        <Button
          variant="ghost"
          onClick={() => {
            const trimmed = link.trim();
            if (!/^https?:\/\//.test(trimmed)) {
              toast.error("Paste a link that starts with https://");
              return;
            }
            onChange(trimmed);
            setLink("");
            toast.success("Image link added");
          }}
        >
          <Link2 className="mr-2 h-4 w-4" /> Use link
        </Button>
      </div>
    </div>
  );
}
