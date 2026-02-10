"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingCart, RotateCcw, Upload, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Extensible: add more brands/shades or load from API later
const PAINT_BRANDS = [
  { id: "asian-paints", name: "Asian Paints" },
  { id: "berger", name: "Berger" },
  { id: "dulux", name: "Dulux" },
  { id: "nippon", name: "Nippon" },
];

const SHADES_BY_BRAND: Record<string, { name: string; hex: string }[]> = {
  "asian-paints": [
    { name: "White", hex: "#F5F5F5" },
    { name: "Ivory", hex: "#FFFFF0" },
    { name: "Cream", hex: "#FFFDD0" },
    { name: "Sky Blue", hex: "#87CEEB" },
    { name: "Mint", hex: "#98FF98" },
    { name: "Lavender", hex: "#E6E6FA" },
    { name: "Peach", hex: "#FFCBA4" },
    { name: "Sage", hex: "#9DC183" },
  ],
  berger: [
    { name: "Snow White", hex: "#FFFAFA" },
    { name: "Lemon", hex: "#FFF44F" },
    { name: "Sandalwood", hex: "#F4D798" },
    { name: "Rose", hex: "#E8B4B8" },
    { name: "Ocean", hex: "#4A90A4" },
    { name: "Mint", hex: "#A8E6CF" },
  ],
  dulux: [
    { name: "Pure Brilliant White", hex: "#FFFFFF" },
    { name: "Antique White", hex: "#FAEBD7" },
    { name: "Dusty Grey", hex: "#A8A8A8" },
    { name: "Teal", hex: "#008080" },
    { name: "Terracotta", hex: "#E2725B" },
  ],
  nippon: [
    { name: "Off White", hex: "#F8F8F0" },
    { name: "Light Grey", hex: "#D3D3D3" },
    { name: "Pistachio", hex: "#93C572" },
    { name: "Sky", hex: "#7EC8E3" },
  ],
};

const DEFAULT_SHADES = SHADES_BY_BRAND["asian-paints"];

// Generate a default wall image (light grey with slight gradient) as data URL
function getDefaultWallDataUrl(width: number, height: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#E8E4DF");
  gradient.addColorStop(0.5, "#DDD8D2");
  gradient.addColorStop(1, "#E2DFD9");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  // Light texture (noise)
  const imageData = ctx.getImageData(0, 0, width, height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 12;
    imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + n));
    imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + n));
    imageData.data[i + 2] = Math.max(0, Math.min(255, imageData.data[i + 2] + n));
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

export interface PaintSelection {
  brand: string;
  brandName: string;
  shadeName: string;
  hex: string;
}

interface PaintColorVisualizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart?: (selection: PaintSelection) => void;
  /** For future AI wall detection */
  className?: string;
}

const CANVAS_W = 480;
const CANVAS_H = 320;

export function PaintColorVisualizer({
  open,
  onOpenChange,
  onAddToCart,
  className,
}: PaintColorVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wallImageRef = useRef<HTMLImageElement | null>(null);
  const [brand, setBrand] = useState(PAINT_BRANDS[0].id);
  const [shades, setShades] = useState(DEFAULT_SHADES);
  const [selectedHex, setSelectedHex] = useState(DEFAULT_SHADES[0].hex);
  const [selectedShadeName, setSelectedShadeName] = useState(DEFAULT_SHADES[0].name);
  const [hexInput, setHexInput] = useState(DEFAULT_SHADES[0].hex);
  const [wallImageUrl, setWallImageUrl] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentBrandName = PAINT_BRANDS.find((b) => b.id === brand)?.name ?? brand;

  useEffect(() => {
    const list = SHADES_BY_BRAND[brand] ?? DEFAULT_SHADES;
    setShades(list);
    const first = list[0];
    if (first) {
      setSelectedHex(first.hex);
      setSelectedShadeName(first.name);
      setHexInput(first.hex);
    }
  }, [brand]);

  const loadDefaultWall = useCallback(() => {
    const dataUrl = getDefaultWallDataUrl(CANVAS_W, CANVAS_H);
    setWallImageUrl(dataUrl);
    setHasApplied(false);
    wallImageRef.current = null;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      wallImageRef.current = img;
    };
    img.src = dataUrl;
  }, []);

  useEffect(() => {
    if (open && !wallImageUrl) loadDefaultWall();
  }, [open, wallImageUrl, loadDefaultWall]);

  const handleWallUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.match(/^image\/(jpeg|png|jpg|webp)/)) return;
    const url = URL.createObjectURL(file);
    setWallImageUrl(url);
    setHasApplied(false);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      wallImageRef.current = img;
    };
    img.src = url;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const applyColor = useCallback(() => {
    const canvas = canvasRef.current;
    const wall = wallImageRef.current;
    if (!canvas || !wall) return;

    setIsApplying(true);
    requestAnimationFrame(() => {
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsApplying(false);
        return;
      }
      canvas.width = CANVAS_W;
      canvas.height = CANVAS_H;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(wall, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = selectedHex;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";
      setHasApplied(true);
      setIsApplying(false);
    });
  }, [selectedHex]);

  const handleHexSubmit = () => {
    const hex = hexInput.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setSelectedHex(hex);
      setSelectedShadeName("Custom");
    }
  };

  const reset = () => {
    setWallImageUrl(null);
    setHasApplied(false);
    loadDefaultWall();
  };

  const selection: PaintSelection = {
    brand,
    brandName: currentBrandName,
    shadeName: selectedShadeName,
    hex: selectedHex,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-2xl max-h-[90vh] overflow-y-auto sm:rounded-lg",
          className
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">Paint Color Visualizer</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 1. Brand */}
          <div>
            <Label className="text-sm font-medium">Brand</Label>
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                {PAINT_BRANDS.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Shade: swatches + HEX */}
          <div>
            <Label className="text-sm font-medium block mb-2">Shade</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {shades.map((s) => (
                <button
                  key={s.hex}
                  type="button"
                  onClick={() => {
                    setSelectedHex(s.hex);
                    setSelectedShadeName(s.name);
                    setHexInput(s.hex);
                  }}
                  className={cn(
                    "w-9 h-9 rounded-lg border-2 transition-all shrink-0",
                    selectedHex === s.hex
                      ? "border-primary ring-2 ring-primary/30 scale-110"
                      : "border-gray-300 hover:border-gray-400"
                  )}
                  style={{ backgroundColor: s.hex }}
                  title={s.name}
                />
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <Input
                placeholder="#FFFFFF"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                className="max-w-[120px] font-mono"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleHexSubmit}>
                Use HEX
              </Button>
            </div>
          </div>

          {/* 3. Wall: default or upload */}
          <div>
            <Label className="text-sm font-medium block mb-2">Wall</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadDefaultWall}
              >
                <ImageIcon className="w-4 h-4 mr-1" />
                Default wall
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-1" />
                Upload image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleWallUpload}
              />
              <Button type="button" variant="ghost" size="sm" onClick={reset}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>

          {/* 4. Apply + Preview */}
          <div>
            <Button
              className="w-full sm:w-auto"
              disabled={!wallImageUrl || isApplying}
              onClick={applyColor}
            >
              {isApplying ? "Applying…" : "Apply color"}
            </Button>
            <div className="mt-4 rounded-lg border bg-muted/30 overflow-hidden flex items-center justify-center min-h-[200px]">
              <canvas
                ref={canvasRef}
                width={CANVAS_W}
                height={CANVAS_H}
                className={cn(
                  "max-w-full h-auto border-0 transition-opacity duration-200",
                  hasApplied ? "opacity-100" : "opacity-60"
                )}
              />
            </div>
          </div>

          {/* 5. CTA - sticky on mobile */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t sticky bottom-0 bg-background pb-2 sm:pb-0">
            <Button
              className="flex-1 w-full"
              onClick={() => onAddToCart?.(selection)}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add paint to cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
