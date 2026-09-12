"use client";

import React, { useState, useRef, useCallback } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import {
  Upload,
  Crop as CropIcon,
  RotateCw,
  ZoomIn,
  ZoomOut,
  X,
  Check,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Link as LinkIcon,
  RefreshCw,
} from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { getCroppedImg, readFileAsDataURL } from "@/lib/crop-image";

type ImageCropUploadProps = {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  aspectRatio?: number; // default 16 / 9
};

type AspectPreset = {
  label: string;
  value: number | undefined;
};

const ASPECT_PRESETS: AspectPreset[] = [
  { label: "16:9 Banner", value: 16 / 9 },
  { label: "4:3 Standard", value: 4 / 3 },
  { label: "1:1 Square", value: 1 },
  { label: "Free Form", value: undefined },
];

export function ImageCropUpload({
  value = "",
  onChange,
  label = "Image Banner",
  helperText = "Upload a PNG or JPG photo. Recommended 16:9 widescreen banner.",
  required = false,
  className = "",
  aspectRatio = 16 / 9,
}: ImageCropUploadProps) {
  // Input mode: "upload" vs "url"
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState(value || "");

  // File & Crop state
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [selectedAspect, setSelectedAspect] = useState<number | undefined>(aspectRatio);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Status states
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync urlInput when external value changes
  React.useEffect(() => {
    if (value && value !== urlInput) {
      setUrlInput(value);
    }
  }, [value]);

  const onCropComplete = useCallback(
    (_croppedArea: Area, currentCroppedAreaPixels: Area) => {
      setCroppedAreaPixels(currentCroppedAreaPixels);
    },
    []
  );

  // Process selected file
  const handleFileSelect = async (file: File) => {
    setErrorMessage(null);

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMessage("Please select a valid PNG or JPG/JPEG image.");
      return;
    }

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File is too large. Maximum size is 10MB.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataURL(file);
      setImageSrc(dataUrl);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setSelectedAspect(aspectRatio);
      setCropModalOpen(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to read image file.");
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
      // Reset input value so same file can be re-selected if desired
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Perform crop and upload to server
  const handleApplyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const croppedBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        "image/jpeg"
      );

      const formData = new FormData();
      formData.append("file", croppedBlob, "banner.jpg");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload cropped image.");
      }

      const result = await response.json();
      onChange(result.url);
      setCropModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err?.message || "Error cropping or uploading image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onChange("");
    setUrlInput("");
    setImageSrc(null);
    setErrorMessage(null);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header Label and Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 pl-3">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-full text-xs">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              mode === "upload"
                ? "bg-white text-gray-800 shadow-xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Upload & Crop
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              mode === "url"
                ? "bg-white text-gray-800 shadow-xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Image URL
          </button>
        </div>
      </div>

      {/* Mode: Upload & Crop */}
      {mode === "upload" && (
        <div>
          {value ? (
            /* PREVIEW OF CROPPED/SAVED IMAGE */
            <div className="relative group overflow-hidden rounded-[28px] border border-gray-200 bg-gray-50 shadow-xs">
              <div className="relative aspect-video w-full overflow-hidden bg-gray-900/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt="Banner preview"
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                  {imageSrc && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setCropModalOpen(true)}
                      className="rounded-full shadow-md bg-white/90 text-gray-800 hover:bg-white text-xs gap-1.5"
                    >
                      <CropIcon size={14} />
                      Re-crop
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full shadow-md bg-white/90 text-gray-800 hover:bg-white text-xs gap-1.5"
                  >
                    <RefreshCw size={14} />
                    Replace
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={handleRemoveImage}
                    className="rounded-full shadow-md text-xs gap-1.5"
                  >
                    <Trash2 size={14} />
                    Remove
                  </Button>
                </div>
              </div>

              {/* Bottom status bar */}
              <div className="flex items-center justify-between px-4 py-2 bg-white border-t border-gray-100 text-xs text-gray-500">
                <span className="flex items-center gap-1.5 text-emerald-600 font-medium truncate max-w-[240px] sm:max-w-xs">
                  <Check size={14} />
                  Banner image active
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary hover:underline font-medium"
                  >
                    Change photo
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* DROPZONE / FILE SELECTOR */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-[28px] border-2 border-dashed p-6 sm:p-8 text-center transition-all ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[0.99]"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60"
              }`}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-primary mb-3">
                <Upload size={24} className="animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-gray-800 mb-1">
                Upload campaign banner
              </p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mb-3">
                Drag and drop your image here, or{" "}
                <span className="text-primary font-semibold hover:underline">
                  click to browse
                </span>
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
                  PNG, JPG, JPEG
                </span>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
                  Up to 10MB
                </span>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      )}

      {/* Mode: Image URL fallback */}
      {mode === "url" && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/... or https://example.com/photo.jpg"
                className="pr-10"
              />
              <LinkIcon
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleUrlSubmit}
              className="rounded-[28px] text-xs px-4"
            >
              Apply
            </Button>
          </div>
          {value && (
            <div className="relative aspect-video max-w-xs overflow-hidden rounded-[20px] border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Banner preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {errorMessage && (
        <p className="text-xs text-red-600 pl-3 font-medium">{errorMessage}</p>
      )}

      {/* Helper text */}
      <p className="text-[11px] text-gray-400 pl-3">{helperText}</p>

      {/* ========================================================================= */}
      {/* INTERACTIVE CROP MODAL */}
      {/* ========================================================================= */}
      {cropModalOpen && imageSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 sm:p-6 backdrop-blur-sm">
          <div className="relative flex flex-col w-full max-w-3xl max-h-[92vh] bg-white rounded-[36px] shadow-2xl overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-primary">
                  <CropIcon size={18} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    Crop & Position Banner
                  </h3>
                  <p className="text-xs text-gray-500">
                    Pan and zoom to frame your campaign banner nicely
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCropModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Cropper Work Area */}
            <div className="relative w-full h-80 sm:h-96 bg-gray-950 select-none">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={selectedAspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                showGrid
                classes={{
                  containerClassName: "relative w-full h-full",
                  cropAreaClassName: "border-2 border-white/80 shadow-2xl rounded-xl",
                }}
              />
            </div>

            {/* Controls Bar */}
            <div className="p-5 sm:p-6 space-y-4 bg-gray-50/70 border-t border-gray-100">
              {/* Aspect Ratio Presets */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-600 mr-1">
                    Aspect:
                  </span>
                  {ASPECT_PRESETS.map((preset) => {
                    const isSelected = selectedAspect === preset.value;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setSelectedAspect(preset.value)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                          isSelected
                            ? "bg-primary text-white shadow-xs"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Rotate button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="rounded-full text-xs gap-1.5 h-8 bg-white"
                >
                  <RotateCw size={14} />
                  Rotate 90°
                </Button>
              </div>

              {/* Zoom slider */}
              <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-200/80 shadow-xs">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
                  className="text-gray-400 hover:text-gray-700 transition"
                  aria-label="Zoom out"
                >
                  <ZoomOut size={16} />
                </button>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                  className="text-gray-400 hover:text-gray-700 transition"
                  aria-label="Zoom in"
                >
                  <ZoomIn size={16} />
                </button>
                <span className="text-xs font-mono text-gray-500 w-12 text-right">
                  {zoom.toFixed(1)}x
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCrop({ x: 0, y: 0 });
                    setZoom(1);
                    setRotation(0);
                    setSelectedAspect(aspectRatio);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-800"
                >
                  Reset Positioning
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCropModalOpen(false)}
                    className="rounded-[28px] text-xs px-5"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleApplyCrop}
                    disabled={isUploading}
                    className="rounded-[28px] text-xs px-6 gap-2 shadow-sm font-semibold"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Saving & Cropping...
                      </>
                    ) : (
                      <>
                        <Check size={15} />
                        Crop & Save Banner
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
