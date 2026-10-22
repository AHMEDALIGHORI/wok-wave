import { ImageResponse } from "next/og";
import { site } from "@/site.config";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: site.colors.lime,
        color: site.colors.ink,
        borderRadius: 16,
        fontSize: 44,
        fontWeight: 900,
      }}
    >
      {site.name.charAt(0)}
    </div>,
    size,
  );
}
