import { describe, expect, it } from "vitest";
import {
  MAX_IMAGE_BYTES,
  isAcceptedImage,
  pickBackgroundIndex,
} from "./background";

function fakeFile(bytes: number[], size = bytes.length): File {
  return {
    size,
    slice: () => ({
      arrayBuffer: async () => new Uint8Array(bytes).buffer,
    }),
  } as unknown as File;
}

describe("pickBackgroundIndex", () => {
  it("never repeats the previous random index", () => {
    for (const count of [2, 3, 5, 10]) {
      let previous: number | null = null;
      for (let seed = 0; seed < 1000; seed += 1) {
        const next = pickBackgroundIndex(seed, count, true, previous);
        expect(next).toBeGreaterThanOrEqual(0);
        expect(next).toBeLessThan(count);
        if (previous !== null) expect(next).not.toBe(previous);
        previous = next;
      }
    }
  });

  it("uses the gallery order when random is off", () => {
    expect(pickBackgroundIndex(7, 3, false)).toBe(1);
    expect(pickBackgroundIndex(-1, 3, false)).toBe(2);
  });

  it("returns 0 for an empty gallery", () => {
    expect(pickBackgroundIndex(42, 0, true)).toBe(0);
  });
});

describe("isAcceptedImage", () => {
  it("accepts PNG, JPEG, and WebP headers", async () => {
    await expect(
      isAcceptedImage(fakeFile([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    ).resolves.toBe(true);
    await expect(isAcceptedImage(fakeFile([0xff, 0xd8, 0xff, 0x00]))).resolves.toBe(
      true,
    );
    await expect(
      isAcceptedImage(
        fakeFile([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]),
      ),
    ).resolves.toBe(true);
  });

  it("rejects other content and oversized files", async () => {
    await expect(isAcceptedImage(fakeFile([0x47, 0x49, 0x46]))).resolves.toBe(
      false,
    );
    await expect(
      isAcceptedImage(fakeFile([0x89, 0x50, 0x4e, 0x47], MAX_IMAGE_BYTES + 1)),
    ).resolves.toBe(false);
  });

  it("rejects a file that cannot be read", async () => {
    const broken = {
      size: 12,
      slice: () => ({
        arrayBuffer: async () => {
          throw new Error("read failed");
        },
      }),
    } as unknown as File;

    await expect(isAcceptedImage(broken)).resolves.toBe(false);
  });
});
