import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

const form = new FormData();
const testImgPath = path.join(process.cwd(), 'scratch', 'redmi.png');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
  <rect width="200" height="200" fill="#5f9104"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-weight="bold">Redmi</text>
</svg>`;

fs.writeFileSync(testImgPath, svgContent);

form.append('images', fs.createReadStream(testImgPath), 'redmi_note_14_pro.png');

try {
  const res = await axios.post('http://localhost:5000/api/v1/uploads/images', form, {
    headers: form.getHeaders()
  });
  console.log('Bulk Image Upload Status:', res.status, '| Images Processed:', res.data.data.length);
} catch (err) {
  console.error('Upload error:', err.response ? err.response.data : err.message);
}
