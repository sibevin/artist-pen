import fixWebmDuration from "fix-webm-duration";

onmessage = async function (e) {
  const { audioChunks, duration } = e.data;
  if (audioChunks.length === 0) {
    postMessage({ audioRecord: null });
    return;
  }
  if (audioChunks[0] && audioChunks[0].size === 0) {
    postMessage({ audioRecord: null });
    return;
  }

  const rawBlob = new Blob(audioChunks, {
    type: "audio/webm;codecs=opus",
  });
  const blob = await fixWebmDuration(rawBlob, duration);
  postMessage({
    audioRecord: {
      dataUrl: URL.createObjectURL(blob),
      duration,
      blob: blob,
    },
  });
};
