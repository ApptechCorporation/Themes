// netlify/functions/fetch-xml.js
// Script Node.js que roda no servidor Netlify (Proxy Serverless)

const fetch = require('node-fetch');

// URL ALVO: O link do arquivo XML que está protegido
const TARGET_URL = 'https://online-theme.wuaze.com/MyThemes.xml';

exports.handler = async (event, context) => {
    try {
        // 1. Tenta a requisição inicial
        const initialResponse = await fetch(TARGET_URL);

        // Se o servidor retornar o XML diretamente, ótimo.
        if (initialResponse.ok && initialResponse.headers.get('Content-Type').includes('xml')) {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/xml" },
                body: await initialResponse.text(),
            };
        }

        // 2. Verifica se houve redirecionamento (que o script de segurança causaria)
        const redirectLocation = initialResponse.headers.get('Location');
            
        if (redirectLocation) {
             // 3. Tenta seguir o redirecionamento (segunda requisição)
             const finalResponse = await fetch(redirectLocation);
             
             if (finalResponse.ok) {
                // Sucesso: Retorna o XML final
                return {
                    statusCode: 200,
                    headers: { "Content-Type": "application/xml" },
                    body: await finalResponse.text(),
                };
             }
        }

        // Se o bypass falhar ou for bloqueado
        return {
            statusCode: 403,
            body: JSON.stringify({ 
                error: 'Falha no bypass do desafio de segurança. A proteção do servidor é muito forte ou o redirecionamento foi bloqueado.' 
            })
        };

    } catch (error) {
        console.error("Erro na função Serverless:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Erro interno ao executar o proxy: ${error.message}` })
        };
    }
};
