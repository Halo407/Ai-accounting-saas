import { getAiResponse } from "../../../utils/getAiResponse";

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message?.trim()) {
      return Response.json(
        { error: "Pesan tidak boleh kosong" },
        { status: 400 }
      );
    }

    const aiReply = await getAiResponse(message);

    return Response.json({ reply: aiReply });
  } catch (error) {
    console.error("Chat API Error:", error);
    return Response.json(
      { error: "Gagal memproses pesan" },
      { status: 500 }
    );
  }
}
