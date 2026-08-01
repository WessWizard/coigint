// ============================================================
// PROXY PARA GITHUB GIST - NETLIFY FUNCTIONS
// ============================================================

// 🔑 Configuração do Gist
const GIST_ID = '363ae81662880bdaf8950670b30579e0';
const GITHUB_TOKEN = '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';
const FILENAME = 'nbot-data.json';
const API_URL = `https://api.github.com/gists/${GIST_ID}`;

// ============================================================
// FUNÇÃO PRINCIPAL
// ============================================================

exports.handler = async function(event, context) {
    // Cabeçalhos CORS - PERMITINDO TUDO
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    };

    // Responde requisições OPTIONS (preflight CORS)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers
        };
    }

    try {
        // ============================================================
        // ROTA: GET - Buscar dados
        // ============================================================
        if (event.httpMethod === 'GET') {
            console.log('🔄 GET - Buscando dados do GitHub Gist...');

            const response = await fetch(API_URL, {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error(`GitHub API: ${response.status} - ${response.statusText}`);
            }

            const gist = await response.json();
            const content = gist.files[FILENAME]?.content;

            if (!content) {
                const defaultData = {
                    ano: new Date().getFullYear(),
                    ultimoNumero: 732,
                    totalGerados: 732,
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

        // ============================================================
        // ROTA: POST - Gerar novo número
        // ============================================================
        if (event.httpMethod === 'POST') {
            console.log('📝 POST - Gerando novo número...');

            // 1. Busca dados atuais
            const responseGet = await fetch(API_URL, {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!responseGet.ok) {
                throw new Error(`GitHub API GET: ${responseGet.status}`);
            }

            const gist = await responseGet.json();
            const content = gist.files[FILENAME]?.content;

            let data;
            if (!content) {
                data = {
                    ano: new Date().getFullYear(),
                    ultimoNumero: 732,
                    totalGerados: 732,
                    historico: []
                };
            } else {
                data = JSON.parse(content);
            }

            // 2. Incrementa
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

            // Limita histórico a 1000
            if (data.historico.length > 1000) {
                data.historico = data.historico.slice(-1000);
            }

            // 3. Salva no GitHub
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
                throw new Error(`GitHub API SAVE: ${responseSave.status}`);
            }

            // 4. Retorna
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
            body: JSON.stringify({
                success: false,
                error: `Método ${event.httpMethod} não suportado`
            })
        };

    } catch (error) {
        console.error('❌ Erro na função:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message || 'Erro interno do servidor'
            })
        };
    }
};
