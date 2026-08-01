// ============================================================
// PROXY PARA GITHUB GIST - NETLIFY FUNCTIONS
// ============================================================

const GIST_ID = '363ae81662880bdaf8950670b30579e0';
const GITHUB_TOKEN = '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';
const FILENAME = 'nbot-data.json';
const API_URL = `https://api.github.com/gists/${GIST_ID}`;

exports.handler = async function(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    try {
        // GET - Buscar dados
        if (event.httpMethod === 'GET') {
            console.log('🔄 Buscando dados do GitHub Gist...');

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
            const content = gist.files[FILENAME]?.content;

            if (!content) {
                const defaultData = {
                    ano: new Date().getFullYear(),
                    ultimoNumero: 760,
                    totalGerados: 760,
                    historico: []
                };
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ success: true, data: defaultData })
                };
            }

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

        // POST - Gerar novo número
        if (event.httpMethod === 'POST') {
            console.log('📝 Gerando novo número...');

            // Busca dados atuais
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
            const content = gist.files[FILENAME]?.content;

            let data;
            if (!content) {
                data = {
                    ano: new Date().getFullYear(),
                    ultimoNumero: 760,
                    totalGerados: 760,
                    historico: []
                };
            } else {
                data = JSON.parse(content);
            }

            // Incrementa
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

            if (data.historico.length > 1000) {
                data.historico = data.historico.slice(-1000);
            }

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

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ success: false, error: 'Método não suportado' })
        };

    } catch (error) {
        console.error('❌ Erro:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
