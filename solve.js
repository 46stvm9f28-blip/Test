export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({error:'OPENAI_API_KEY chưa được cấu hình'});
  const { image } = req.body || {};
  if (typeof image !== 'string' || !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(image) || image.length > 1800000) return res.status(400).json({error:'Ảnh không hợp lệ hoặc quá lớn'});
  try {
    const r = await fetch('https://api.openai.com/v1/responses', {
      method:'POST', headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},
      body:JSON.stringify({model:process.env.OPENAI_MODEL || 'gpt-4.1-mini',max_output_tokens:160,
        input:[{role:'user',content:[{type:'input_text',text:'Đọc câu hỏi trắc nghiệm và các lựa chọn trong ảnh. Chỉ chọn A, B, C hoặc D khi đủ thông tin và chắc chắn; nếu ảnh mờ, thiếu đáp án, không có câu hỏi trắc nghiệm hoặc không chắc chắn, trả về ?. Chỉ xuất JSON dạng {"answer":"A|B|C|D|?"}; không thêm chữ khác.'},{type:'input_image',image_url:image}]}],
        text:{format:{type:'json_schema',name:'answer_result',strict:true,schema:{type:'object',properties:{answer:{type:'string',enum:['A','B','C','D','?']}},required:['answer'],additionalProperties:false}}}})
    });
    const data = await r.json();
    if(!r.ok) return res.status(r.status === 429 ? 429 : 502).json({error:data.error?.message || 'Lỗi AI'});
    const output = data.output?.flatMap(x=>x.content || []).find(x=>x.type==='output_text')?.text;
    const answer = JSON.parse(output || '{}').answer;
    if(!['A','B','C','D','?'].includes(answer)) throw new Error('Invalid AI output');
    res.setHeader('Cache-Control','no-store');
    return res.status(200).json({answer});
  } catch(e) { return res.status(502).json({error:'Không thể xử lý ảnh. Vui lòng thử lại.'}); }
}
