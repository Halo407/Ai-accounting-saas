export async function getAiResponse(userMessage) {
  if (!userMessage?.trim()) {
    throw new Error("Pesan pengguna tidak boleh kosong");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch("https://api.awanllm.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.QWEN_API_KEY}`
      },
      body: JSON.stringify({
        model: "qwen2.5:latest",
        messages: [
          {
            role: "system",
            content: "Anda adalah asisten akuntansi AI yang membantu pengguna dengan pertanyaan seputar akuntansi, perpajakan, dan keuangan UMKM. Berikan jawaban yang akurat, ringkas, dan profesional."
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 0.4,
        max_tokens: 512
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error: ${response.status} - ${errorData.message || "Gagal menghubungi API"}`);
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content?.trim();

    if (!aiContent) {
      throw new Error("Respons AI kosong");
    }

    // Sanitasi sederhana
    return aiContent.replace(/\u0000/g, ""); // Hapus null bytes
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw error;
  }
}
