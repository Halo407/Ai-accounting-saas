import { getAiResponse } from "../../../utils/getAiResponse";

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string' || !message.trim()) {
      return Response.json(
        { error: "Pesan harus berupa string tidak kosong" },
        { status: 400 }
      );
    }

    const aiReply = await getAiResponse(message);

    return Response.json({ reply: aiReply });
  } catch (error) {
    console.error("API Chat Error:", error);
    return Response.json(
      { error: "Gagal mendapatkan respons dari AI" },
      { status: 500 }
    );
  }
}
