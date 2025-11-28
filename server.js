const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. 允許所有來源連線 (解決 CORS 核心問題)
app.use(cors());

// 定義各縣市的原始資料 URL
const CITY_URLS = {
    keelung: 'https://opendata-kl.askeycloud.com/route_klepb.csv',
    taipei: 'https://data.taipei/api/dataset/6bb3304b-4f46-4bb0-8cd1-60c66dcd1cae/resource/a6e90031-7ec4-4089-afb5-361a4efe7202/download',
    new_taipei: 'https://data.ntpc.gov.tw/api/datasets/edc3ad26-8ae7-4916-a00b-bc6048d19bf8/csv/file',
    taichung: 'https://datacenter.taichung.gov.tw/swagger/OpenData/c923ad20-2ec6-43b9-b3ab-54527e99f7bc',
    tainan: 'https://www.tnepb.gov.tw/opendata/TrashCarPositions.csv',
    kaohsiung: 'https://openapi.kcg.gov.tw/Api/Service/Get/14fe516d-ac62-4905-9325-70daae7616bd',
    yilan: 'https://opendata.ilepb.gov.tw/ILEPB04004?media=file'
};

// 2. 建立 API 路由
// 用法: /api/proxy?city=taipei
app.get('/api/proxy', async (req, res) => {
    const city = req.query.city;

    if (!city || !CITY_URLS[city]) {
        return res.status(400).json({ error: '請提供有效的城市代碼 (city id)' });
    }

    const targetUrl = CITY_URLS[city];
    console.log(`正在抓取 ${city} 資料...`);

    try {
        // 3. 伺服器代替前端去抓資料
        const response = await axios.get(targetUrl, {
            responseType: 'arraybuffer', // 確保二進制資料(如中文編碼)不會亂掉
            headers: {
                // 模擬瀏覽器，有些政府 API 會擋沒有 User-Agent 的請求
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // 設定回傳標頭，告訴前端這是什麼格式
        const contentType = response.headers['content-type'];
        res.setHeader('Content-Type', contentType);
        
        // 將抓到的資料直接轉發回給前端
        res.send(response.data);

    } catch (error) {
        console.error('抓取失敗:', error.message);
        res.status(500).json({ error: '無法取得政府資料', details: error.message });
    }
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`Proxy Server is running on port ${PORT}`);
});