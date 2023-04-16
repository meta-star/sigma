"use strict";

module.exports = {
    subject: (data) => `轉移 ${data.website} 上的Sigma系統帳號`,
    text: (data) => `
        您好，這裡是 ${data.website} 網站，有人將帳號轉移到您的信箱 ${data.to} 上。
        
        這裡是您的轉移代碼：${data.code}

        這份請求來自於IP：${data.ip_address}

        若您未曾請求過該代碼，請您無視本電子郵件。
        
        「Sigma」是 MetaStar Projects. (https://projects.starinc.xyz) 所屬的單一登入系統。
    `,
    html: (data) => `
        您好，這裡是 ${data.website} 網站，有人將帳號轉移到您的信箱 ${data.to} 上<br/>
        <p>
            這裡是您的轉移代碼：<br/>
            <code>${data.code}</code>
        </p>
        <p>
            這份請求來自於IP：<br/>
            ${data.ip_address}
        </p>
        <p>若您未曾請求過該代碼，請您無視本電子郵件。</p>
        「Sigma」是
        <a href="https://projects.starinc.xyz">MetaStar Projects.</a>
        所屬的單一登入系統。<br/>
    `,
};
