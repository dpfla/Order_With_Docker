"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const SERVER_URL = 'http://localhost:3000/orders';
const PRODUCT_ID = process.argv[2];
if (!PRODUCT_ID) {
    console.error('Error: 상품 번호를 입력해주세요.');
    console.log('Usage: npx ts-node stress-test.ts <PRODUCT_ID>');
    process.exit(1);
}
async function sendOrderRequest(i) {
    try {
        await axios_1.default.post(SERVER_URL, {
            productId: PRODUCT_ID,
            quantity: 1,
        });
        console.log(`User ${i}: Success`);
        return { success: true };
    }
    catch (error) {
        if (error.response) {
            console.log(`User ${i}: Failed - ${error.response.data.message}`);
        }
        else {
            console.log(`User ${i}: Error - ${error.message}`);
        }
        return { success: false };
    }
}
async function runStressTest() {
    console.log(`주문 시도: ${PRODUCT_ID}`);
    console.log('요청 15번, 상품 10개');
    const requests = [];
    for (let i = 1; i <= 15; i++) {
        requests.push(sendOrderRequest(i));
    }
    const results = await Promise.all(requests);
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;
    console.log('--------------------------------------------------');
    console.log(`완료`);
    console.log(`주문 성공 횟수: ${successCount}`);
    console.log(`주문 실패 횟수: ${failCount}`);
    if (successCount > 10) {
        console.error('CRITICAL FAILURE: 10개 이상 팔렸음!');
    }
    else if (successCount === 10) {
        console.log('SUCCESS: 10개 팔림.');
    }
    else {
        console.log('Warning: 10개 미만 팔림.');
    }
    console.log('--------------------------------------------------');
}
runStressTest();
//# sourceMappingURL=stress-test.js.map