// ============================================================
// PROXY PARA GITHUB GIST - NETLIFY FUNCTIONS
// ============================================================

// 🔑 Configuração do Gist (ESCONDIDA no servidor)
const GIST_ID = '363ae81662880bdaf8950670b30579e0';
const GITHUB_TOKEN = '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'; // ← COLOQUE SEU TOKEN AQUI
const FILENAME = 'nbot-data.json';
const API_URL = `https://api.github.com/gists/${GIST_ID}`;

// ============================================================
// FUNÇÃO PRINCIPAL
// ============================================================

exports.handler = async function(event, context) {
    // Cabeçalhos CORS (permitindo qualquer origem)
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Responde requisições OPTIONS (preflight CORS)
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    try {
        // ============================================================
        // ROTA: GET - Buscar dados
        // ============================================================
        if (event.httpMethod === 'GET') {
            console.log('🔄 Buscando dados do GitHub...');
            
            const response = await fetch(API_URL, {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const gist = await response.json();
            const content = gist.files[FILENAME]?.content || '{"ano":2026,"ultimoNumero":732,"totalGerados":732,"historico":[]}';
            const data = JSON.parse(content);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: {
                        ano: data.ano,
                        ultimoNumero: data.ultimoNumero,
                        totalGerados: data.totalGerados,
                        historico: data.historico || []
                    }
                })
            };
        }

        // ============================================================
        // ROTA: POST - Gerar novo número
        // ============================================================
        if (event.httpMethod === 'POST') {
            console.log('💾 Gerando novo número no GitHub...');

            // Busca os dados atuais
            const responseGet = await fetch(API_URL, {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!responseGet.ok) {
                throw new Error(`HTTP ${responseGet.status}: ${responseGet.statusText}`);
            }

            const gist = await responseGet.json();
            const content = gist.files[FILENAME]?.content || '{"ano":2026,"ultimoNumero":732,"totalGerados":732,"historico":[]}';
            const data = JSON.parse(content);

            // Incrementa o número
            const anoAtual = new Date().getFullYear();
            
            if (data.ano !== anoAtual) {
                data.ano = anoAtual;
                data.ultimoNumero = 0;
                data.totalGerados = 0;
            }

            data.ultimoNumero += 1;
            data.totalGerados += 1;

            if (!data.historico) data.historico = [];
            data.historico.push({
                numero: `${data.ultimoNumero}/${data.ano}`,
                data: new Date().toISOString(),
                sequencial: data.ultimoNumero
            });

            // Salva no GitHub
            const responseSave = await fetch(API_URL, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    files: {
                        [FILENAME]: {
                            content: JSON.stringify(data, null, 2)
                        }
                    }
                })
            });

            if (!responseSave.ok) {
                throw new Error(`HTTP ${responseSave.status}: ${responseSave.statusText}`);
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: {
                        nbot: `${data.ultimoNumero}/${data.ano}`,
                        sequencial: data.ultimoNumero,
                        ano: data.ano,
                        totalGerados: data.totalGerados,
                        historico: data.historico || []
                    }
                })
            };
        }

        // Método não suportado
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Método não suportado' })
        };

    } catch (error) {
        console.error('❌ Erro:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};
