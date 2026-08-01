// script.js - Modificado para não permitir salvar ocorrências vazias
function timeToMinutes(time) {
    if (!time || !validateTimeFormat(time)) return Infinity;
    
    const [hours, minutes] = time.split(':').map(Number);
    const isNextDay = isNextDayTime(time);
    
    return (isNextDay ? 24 * 60 : 0) + hours * 60 + minutes;
}

const { jsPDF } = window.jspdf || {};
let uniqueId = 0, boletimId = 0, sectionToRemove = null, isDarkMode = false, imageId = 0;

const activities = [
    "1. ACOMPANHAMENTO DA OPERAÇÃO VIA CÂMERAS",
    "2. ACOMPANHAMENTO DAS PRINCIPAIS VIAS",
    "3. ACOMPANHAMENTO DE FLUXO DE VEÍCULOS",
    "4. ACIONAMENTO DA GTT",
    "5. ACIONAMENTO DA PATRULHA DA MULHER",
    "6. ACIONAMENTO DA PATRULHA ESCOLAR",
    "7. ACIONAMENTO DA RONDAP",
    "8. ACIONAMENTO DA ROMU",
    "9. ACIONAMENTO GRUPAMENTO AMBIENTAL",
    "10. ALAGAMENTO",
    "11. ÁRVORE TOMBADA",
    "12. ATUALIZAÇÃO PLANILHA DE HOMICÍDIO",
    "13. BUSCA RETROSPECTIVA",
    "14. CADASTRO DE VIATURAS",
    "15. CÂMERAS INOPERANTES",
    "16. CHAMADA TÉCNICA",
    "17. DENÚNCIA DE ANIMAIS NA VIA",
    "18. DENÚNCIA DE ARROMBAMENTO",
    "19. DENÚNCIA DE INFRAÇÃO DE TRÂNSITO",
    "20. PERTURBAÇÃO DO SOSSEGO/TRANQUILIDADE PÚBLICA",
    "21. DENÚNCIA DE VIOLÊNCIA CONTRA MULHER",
    "22. DESLIZAMENTO DE BARREIRA",
    "23. DESORDENAMENTO DE COMÉRCIO IRREGULAR",
    "24. ENCAMINHAMENTO PARA OUTRAS SECRETARIAS",
    "25. ENCAMINHAMENTO PARA OUTROS ÓRGÃOS",
    "26. FECHAMENTO DE LIVRO",
    "27. INCÊNDIO",
    "28. INOPERÂNCIA DO SISTEMA DE CÂMERAS",
    "29. LEVANTAMENTO DE INFORMAÇÕES VIA REDES SOCIAIS",
    "30. MONITORAMENTO DE EVENTO",
    "31. OCORRÊNCIA DE SINISTRO DE TRÂNSITO",
    "32. OPERAÇÃO DE PATRULHAMENTO OSTENSIVO",
    "33. ORDEM DE SERVIÇO",
    "34. OUTRAS OCORRÊNCIAS NÃO CRIMINAIS",
    "35. PROTESTO",
    "36. RECEBIMENTO DAS INFORMAÇÕES",
    "37. REGISTRO DE ALTERAÇÕES",
    "38. SINISTRO DE TRÂNSITO SEM VÍTIMA",
    "39. AMEAÇA",
    "40. AMEAÇA POR VIOLÊNCIA DOMÉSTICA/FAMILIAR",
    "41. APROPRIAÇÃO INDÉBITA",
    "42. ASSÉDIO SEXUAL",
    "43. CÁRCERE PRIVADO",
    "44. CRIMES CONTRA AS RELAÇÕES DE CONSUMO",
    "45. CRUELDADE CONTRA ANIMAIS",
    "46. DANO/DEPREDACAO",
    "47. DESACATO",
    "48. DESCUMPRIMENTO DE MEDIDA PROTETIVA DE URGÊNCIA",
    "49. DESENTENDIMENTO/DISCUSSÃO",
    "50. ESTELIONATO/FRAUDE",
    "51. ESTELIONATO/FRAUDE ELETRÔNICA",
    "52. FALSA IDENTIDADE/FALSIDADE IDEOLÓGICA",
    "53. FURTO A OUTRAS INSTITUIÇÕES FINANCEIRAS",
    "54. FURTO A TRANSEUNTE",
    "55. FURTO EM ESTABELECIMENTO COMERCIAL OU DE SERVIÇOS",
    "56. FURTO EM RESIDÊNCIA",
    "57. FURTO (SAÍDA DE BANCO/INSTITUIÇÃO FINANCEIRA)",
    "58. OUTROS FURTOS",
    "59. OUTROS ROUBOS",
    "60. POSSE/INVASÃO DE PROPRIEDADE",
    "61. RIXA",
    "62. REBOQUE",
    "63. ROUBO A ÔNIBUS",
    "64. ROUBO A OUTRAS INSTITUIÇÕES FINANCEIRAS",
    "65. ROUBO A OUTROS TRANSPORTES COLETIVOS",
    "66. ROUBO A TRANSEUNTE",
    "67. ROUBO COM RESTRIÇÃO DA LIBERDADE DA VÍTIMA",
    "68. ROUBO EM ESTABELECIMENTO COMERCIAL OU DE SERVIÇOS",
    "69. ROUBO EM RESIDÊNCIA",
    "70. ROUBO (SAÍDA DE BANCO/INSTITUIÇÃO FINANCEIRA)",
    "71. VIAS DE FATO",
    "72. OCORRÊNCIA DEFESA CIVIL",
    "73. SINISTRO DE TRÂNSITO COM VÍTIMA",
    "74. SOLICITAÇÃO DE IMAGENS",
    "75. OUTROS"
];

const cameras = [
    "Nenhuma", "1. PRAÇA 9 DE JULHO - RETAGUARDA", "2. PRAÇA 9 DE JULHO - FRENTE", "3. EM FRENTE A SMDS E BANCO DO BRASIL",
    "4. PREFEITURA - FRENTE", "5. PREFEITURA - RETAGUARDA", "6. SECRETARIA DE EDUCAÇÃO",
    "7. PRAÇA DO CAIC", "8. PRAÇA MARCOS FREIRE", "9. ESTACIONAMENTO DO MERCADO PÚBLICO",
    "10. ESCOLA VEREADOR REGINALDO LORETO", "11. CREDIMOVEIS NOVOLAR", "12. AV. PROF. DIOGENES X RUA DIACONO ABDIAS",
    "13. ESCOLA MODELO MANOEL DAVI", "14. POLICLÍNICA JAMACI DE MEDEIROS", "15. RUA DA LINHA", "16. PRAÇA DA ESTAÇÃO", "17. PARQUE DOS EUCALIPTOS", "18. AV. LAURA CAVALCANTI (BRADESCO)", "19. PRAÇA DA ORLA (GAIBU)", "20. AV. LAURA CAVALCANTI (SEMÁFORO)", "21. PE-28 / ANTIGA ESTRADA DE SUAPE", "22. PE 28 PRÓXIMO A ESCOLA MODELO DE ENSEADAS", "23. ACADEMIA DA CIDADE - GARAPU", "24. PRAÇA DA BÍBLIA", "25. AV. HISTORIADOR ISRAEL FELIPE X AV. ALM. PAULO MOREIRA", "26. AV. ALM. PAULO MOREIRA X RUA GOV. MIGUEL ARRAES", "27. FISHEYE - ESCOLA MODELO MANOEL DAVI", "28. ESCOLA MODELO DE GARAPU", "29. VILA CLAUDETE", "30. FISHEYE - AV. LAURA CAVALCANTI (BRADESCO)", "31. PRAÇA DO JACARÉ", "32. ANTIGA BR-101 - EM FRENTE AO HOSPITAL INFANTIL", "33. FH - CENTRAL DA GUARDA", "34. FH - ESTACIONAMENTO CENTRAL DA GUARDA", "35. PRAÇA THÉO SILVA", "36. HOSPITAL MENDO SAMPAIO", "37. ITAPUAMA - PÁTIO DE EVENTOS", "38. ESCOLA MODELO DE PONTEZINHA", "39. IGREJA RAINHA DA PAZ - PONTEZINHA", "40. ATACAREJO DOS BOMBONS - USF TORRINHA", "41. PIRAPAMA I - EM FRENTE A FUNASE", "42. MERCÊS", "43. PE-09 - AV. 5 (ENTRADA ENSEADA DOS CORAIS)", "44. PE-28 TREVO ENSEADA DOS CORAIS", "45. PRAÇA DE SUAPE", "46. CENTRO DE ESPECIALIDADES 1 - PONTE DOS CARVALHOS", "47. CENTRO DE ESPECIALIDADES 2 (PONTE DOS CARVALHOS)", "48. ORLA DE GAIBU (PEDRAS)", "49. PRAÇA DA ORLA 2 (GAIBU)"
];

const defesaCivilTipos = ["Lona", "Corte", "Vistoria"];
const defesaCivilOcorrencias = [
    "DESLIZAMENTO DE BARREIRA",
    "RECOLOCAÇÃO DE LONAS",
    "COLOCAÇÃO DE LONAS PLÁSTICAS",
    "ALAGAMENTO",
    "VISTORIA DE EDIFICAÇÃO",
    "VISTORIA DE BARREIRA",
    "VISTORIA PARA RENOVAÇÃO DE AUXÍLIO",
    "CORTE/PODA DE ÁRVORE DE RISCO EMINENTE",
    "RETIRADA DE LONA NA SECRETARIA",
    "INCÊNDIO/QUEIMADAS",
    "DESABAMENTO DE CASA",
    "OUTRAS OCORRÊNCIAS DEFESA CIVIL"
];

// ========== FUNÇÕES EXISTENTES ==========
function validateDateFormat(date) {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(date)) return false;
    const [, day, month, year] = date.match(regex);
    const dayNum = parseInt(day, 10), monthNum = parseInt(month, 10), yearNum = parseInt(year, 10);
    if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) return false;
    if ([4, 6, 9, 11].includes(monthNum) && dayNum > 30) return false;
    if (monthNum === 2) {
        const isLeapYear = (yearNum % 4 === 0 && yearNum % 100 !== 0) || (yearNum % 400 === 0);
        if (dayNum > (isLeapYear ? 29 : 28)) return false;
    }
    return true;
}

function applyDateMask(input) {
    if (!input) return;
    input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);
        if (value.length > 4) value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
        else if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2)}`;
        e.target.value = value;
    });
    input.addEventListener('blur', (e) => {
        if (e.target.value && !validateDateFormat(e.target.value)) {
            alert('Por favor, insira a data no formato DD/MM/YYYY (ex.: 08/04/2025)');
            e.target.value = '';
        }
    });
}

function validateTimeFormat(time) {
    const regex = /^([0-2][0-9]):([0-5][0-9])$/;
    if (!regex.test(time)) return false;
    const [hours] = time.split(':').map(Number);
    return hours >= 0 && hours <= 23;
}

function isNextDayTime(time) {
    const [hours] = time.split(':').map(Number);
    return hours >= 0 && hours <= 6;
}

function applyTimeMask(input) {
    input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length > 2) value = `${value.slice(0, 2)}:${value.slice(2)}`;
        e.target.value = value;
    });
    input.addEventListener('blur', (e) => {
        if (e.target.value && !validateTimeFormat(e.target.value)) {
            alert('Por favor, insira o horário no formato HH:MM');
            e.target.value = '';
        }
    });
}

function updateBoletimFields(sectionId) {
    const notGeneratedCheckbox = document.getElementById(`not-generated-${sectionId}`);
    const boletimInputs = document.querySelectorAll(`#boletim-group-${sectionId} input[type="text"]`);
    boletimInputs.forEach(input => {
        input.disabled = notGeneratedCheckbox?.checked;
        if (notGeneratedCheckbox?.checked) input.value = "";
    });
}

function updateOccurrences() {
    const sections = document.querySelectorAll('.form-section');
    sections.forEach((section, index) => {
        const h3 = section.querySelector('h3');
        if (h3) h3.textContent = `Ocorrência ${(index + 1).toString().padStart(2, '0')}`;
    });
}

function updateAddButtonPosition() {
    const sectionsContainer = document.getElementById('sections-container');
    if (!sectionsContainer) return;
    const existingAddButtons = sectionsContainer.querySelectorAll('.add-section-btn');
    existingAddButtons.forEach(btn => btn.remove());
    const addButton = document.createElement('button');
    addButton.className = 'add-section-btn';
    addButton.textContent = 'Adicionar Nova Ocorrência (+)';
    addButton.onclick = () => addSection({});
    sectionsContainer.appendChild(addButton);
}

function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function filterList(sectionId, type) {
    const filterInput = document.getElementById(`filter-${type}-${sectionId}`);
    if (!filterInput) return;
    const filterText = removeAccents(filterInput.value.toLowerCase());
    const checkboxes = document.querySelectorAll(`input[name="${type}-${sectionId}"]`);
    checkboxes.forEach(checkbox => {
        const label = removeAccents(checkbox.nextElementSibling.textContent.toLowerCase());
        const parentDiv = checkbox.parentElement;
        parentDiv.style.display = label.includes(filterText) ? 'flex' : 'none';
    });
}

function toggleExpand(sectionId, type) {
    const checkboxList = document.getElementById(`${type}-list-${sectionId}`);
    const expandBtn = document.getElementById(`expand-${type}-${sectionId}`);
    if (!checkboxList || !expandBtn) return;
    checkboxList.classList.toggle('expanded');
    expandBtn.textContent = checkboxList.classList.contains('expanded') ? 'Retrair ▼' : 'Expandir ▲';
}

function triggerImageUpload(sectionId, imgId) {
    const input = document.getElementById(`image-input-${sectionId}-${imgId}`);
    if (input) input.click();
}

function previewImage(sectionId, imgId) {
    const input = document.getElementById(`image-input-${sectionId}-${imgId}`);
    const previewContainer = document.getElementById(`image-preview-container-${sectionId}-${imgId}`);
    if (!input || !previewContainer) return;
    previewContainer.innerHTML = '';

    if (input.files && input.files.length > 0) {
        Array.from(input.files).forEach((file, idx) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const wrapperId = `image-preview-wrapper-${sectionId}-${imgId}-${idx}`;
                previewContainer.insertAdjacentHTML('beforeend', `
                    <div class="image-preview-wrapper" id="${wrapperId}">
                        <img class="image-preview" src="${e.target.result}" alt="Prévia da imagem">
                        <button class="remove-image-btn" onclick="removeSingleImage('${sectionId}', ${imgId}, ${idx})">×</button>
                    </div>
                `);
            };
            reader.readAsDataURL(file);
        });
    }
}

function removeSingleImage(sectionId, imgId, imageIdx) {
    const wrapper = document.getElementById(`image-preview-wrapper-${sectionId}-${imgId}-${imageIdx}`);
    if (wrapper) wrapper.remove();
}

function addImageField(sectionId, imageSrcArray = []) {
    imageId++;
    const imageContainer = document.getElementById(`image-container-${sectionId}`);
    if (!imageContainer) return;
    const imageField = `
        <div class="image-upload-field" id="image-field-${sectionId}-${imageId}">
            <input type="file" id="image-input-${sectionId}-${imageId}" accept="image/*" multiple onchange="previewImage('${sectionId}', ${imageId})" style="display: none;">
            <button class="add-image-btn" onclick="triggerImageUpload('${sectionId}', ${imageId})">Adicionar Imagem</button>
        </div>
        <div class="image-preview-container" id="image-preview-container-${sectionId}-${imageId}">
            ${imageSrcArray.map((src, idx) => `
                <div class="image-preview-wrapper" id="image-preview-wrapper-${sectionId}-${imageId}-${idx}">
                    <img class="image-preview" src="${src}" alt="Prévia da imagem">
                    <button class="remove-image-btn" onclick="removeSingleImage('${sectionId}', ${imageId}, ${idx})">×</button>
                </div>
            `).join('')}
        </div>
    `;
    imageContainer.insertAdjacentHTML('beforeend', imageField);
}

function addSection(data = {}) {
    uniqueId++;
    const sectionId = `section-${uniqueId}`;
    const optionsHTML = activities.map((opt, idx) => {
        const value = opt.replace(/^\d+\.\s/, '');
        const isChecked = data.options?.includes(value) || false;
        return `
            <div class="checkbox-group">
                <input type="checkbox" id="option-${sectionId}-${idx}" name="option-${sectionId}" value="${value}" ${isChecked ? 'checked' : ''} onchange="handleActivityChange('${sectionId}')">
                <label for="option-${sectionId}-${idx}">${opt}</label>
            </div>
        `;
    }).join('');

    const camerasHTML = cameras.map((cam, idx) => {
        const isChecked = data.cameras?.includes(cam) || false;
        return `
            <div class="checkbox-group">
                <input type="checkbox" id="camera-${sectionId}-${idx}" name="camera-${sectionId}" value="${cam}" ${isChecked ? 'checked' : ''}>
                <label for="camera-${sectionId}-${idx}">${cam}</label>
            </div>
        `;
    }).join('');

    let boletimHTML = '';
    if (data.options?.includes("ACIONAMENTO DA GTT")) {
        boletimHTML = `
            <div id="boletim-group-${sectionId}" class="boletim-group">
                <div class="form-group boletim-field" id="boletim-field-${sectionId}-0">
                    <label for="boletim-num-${sectionId}-0">Número do Boletim de Ocorrência de Trânsito:</label>
                    <input type="text" id="boletim-num-${sectionId}-0" placeholder="Digite o número do boletim" value="${data.boletins?.[0] || ''}" ${data.notGenerated ? 'disabled' : ''}>
                    <button class="add-boletim-btn" onclick="addBoletimField('${sectionId}')">+</button>
                </div>
                ${data.boletins?.slice(1).map((boletim, idx) => `
                    <div class="form-group boletim-field" id="boletim-field-${sectionId}-${idx + 1}">
                        <label></label>
                        <input type="text" id="boletim-num-${sectionId}-${idx + 1}" placeholder="Digite o número do boletim" value="${boletim}" ${data.notGenerated ? 'disabled' : ''}>
                        <button class="remove-boletim-btn" onclick="removeBoletimField('${sectionId}', ${idx + 1})">–</button>
                    </div>
                `).join('') || ''}
                <div class="checkbox-group">
                    <input type="checkbox" id="not-generated-${sectionId}" name="not-generated-${sectionId}" ${data.notGenerated ? 'checked' : ''}>
                    <label for="not-generated-${sectionId}">Não gerado</label>
                </div>
            </div>
        `;
    }

    let defesaCivilHTML = '';
    if (data.defesaCivil) {
        defesaCivilHTML = `
            <div id="defesa-civil-group-${sectionId}" class="defesa-civil-group">
                <div class="form-group">
                    <label>Tipo de Ocorrência:</label>
                    <div class="radio-group">
                        ${defesaCivilTipos.map(tipo => `
                            <div class="radio-option">
                                <input type="radio" id="tipo-${sectionId}-${tipo.toLowerCase()}" name="tipo-${sectionId}" value="${tipo}" ${data.defesaCivil.tipo === tipo ? 'checked' : ''}>
                                <label for="tipo-${sectionId}-${tipo.toLowerCase()}">${tipo}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="form-group">
                    <label>Ocorrência:</label>
                    <div class="checkbox-list">
                        ${defesaCivilOcorrencias.map(ocorrencia => `
                            <div class="checkbox-group">
                                <input type="checkbox" id="ocorrencia-${sectionId}-${ocorrencia.toLowerCase().replace(/\s+/g, '-')}" name="ocorrencia-${sectionId}" value="${ocorrencia}" ${data.defesaCivil.ocorrencias?.includes(ocorrencia) ? 'checked' : ''}>
                                <label for="ocorrencia-${sectionId}-${ocorrencia.toLowerCase().replace(/\s+/g, '-')}">${ocorrencia}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="form-group">
                    <label for="protocolo-${sectionId}">Número do Protocolo:</label>
                    <input type="text" id="protocolo-${sectionId}" placeholder="Digite o número do protocolo" value="${data.defesaCivil.protocolo || ''}">
                </div>
            </div>
        `;
    }

    const sectionHTML = `
        <div class="divider"></div>
        <div class="form-section" id="${sectionId}">
            <h3 style="text-align:center; font-weight: 500;"></h3>
            <div class="form-group">
                <label>Atividade Observada:</label>
                <div>
                    <input type="text" id="filter-option-${sectionId}" class="filter-input" placeholder="Pesquisar atividades..." oninput="filterList('${sectionId}', 'option')">
                    <button class="expand-btn" id="expand-option-${sectionId}" onclick="toggleExpand('${sectionId}', 'option')">Expandir ▲</button>
                    <div class="checkbox-list" id="option-list-${sectionId}">${optionsHTML}</div>
                </div>
            </div>
            <div class="form-group">
                <label>Câmeras:</label>
                <div>
                    <input type="text" id="filter-camera-${sectionId}" class="filter-input" placeholder="Pesquisar câmeras..." oninput="filterList('${sectionId}', 'camera')">
                    <button class="expand-btn" id="expand-camera-${sectionId}" onclick="toggleExpand('${sectionId}', 'camera')">Expandir ▲</button>
                    <div class="checkbox-list" id="camera-list-${sectionId}">${camerasHTML}</div>
                </div>
            </div>
            <div class="image-upload-group">
                <label for="image-container-${sectionId}">(Opcional) Imagens:</label>
                <div class="image-upload-container" id="image-container-${sectionId}">
                    ${data.images && data.images.length > 0 ? '' : `
                        <div class="image-upload-field" id="image-field-${sectionId}-0">
                            <input type="file" id="image-input-${sectionId}-0" accept="image/*" multiple onchange="previewImage('${sectionId}', 0)" style="display: none;">
                            <button class="add-image-btn" onclick="triggerImageUpload('${sectionId}', 0)">Adicionar Imagem</button>
                        </div>
                        <div class="image-preview-container" id="image-preview-container-${sectionId}-0"></div>
                    `}
                </div>
            </div>
            <div class="form-group">
                <label for="location-${sectionId}">Local:</label>
                <input type="text" id="location-${sectionId}" placeholder="Digite o local da ocorrência" value="${data.location || ''}">
            </div>
            <div class="form-group">
                <label for="time-${sectionId}">Horário:</label>
                <input type="text" id="time-${sectionId}" placeholder="HH:MM (ex.: 23:00 ou 02:00 para próxima madrugada)" value="${data.time || ''}">
                <span class="time-tooltip">00:00-06:00 refere-se ao dia seguinte</span>
            </div>
            <div class="form-group">
                <label for="comments-${sectionId}">Descrição:</label>
                <textarea id="comments-${sectionId}" placeholder="Digite a descrição">${data.comments || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="outcome-${sectionId}">Desfecho:</label>
                <textarea id="outcome-${sectionId}" placeholder="Digite o desfecho da ocorrência">${data.outcome || ''}</textarea>
            </div>
            ${boletimHTML}
            ${defesaCivilHTML}
            <button class="remove-section-btn" onclick="askRemoveSection('${sectionId}')">Remover Seção</button>
        </div>
    `;

    const sectionsContainer = document.getElementById('sections-container');
    if (sectionsContainer) {
        sectionsContainer.insertAdjacentHTML('beforeend', sectionHTML);
    }
    updateOccurrences();
    updateAddButtonPosition();

    if (data.images && data.images.length > 0) {
        addImageField(sectionId, data.images);
    }

    if (data.options?.includes("ACIONAMENTO DA GTT")) {
        const notGeneratedCheckbox = document.getElementById(`not-generated-${sectionId}`);
        if (notGeneratedCheckbox) {
            notGeneratedCheckbox.addEventListener('change', () => updateBoletimFields(sectionId));
        }
        updateBoletimFields(sectionId);
    }

    const timeInput = document.getElementById(`time-${sectionId}`);
    if (timeInput) applyTimeMask(timeInput);
}

function addBoletimField(sectionId) {
    boletimId++;
    const boletimGroup = document.getElementById(`boletim-group-${sectionId}`);
    const notGeneratedCheckbox = document.getElementById(`not-generated-${sectionId}`);
    if (!boletimGroup || !notGeneratedCheckbox) return;
    const newBoletimField = `
        <div class="form-group boletim-field" id="boletim-field-${sectionId}-${boletimId}">
            <label></label>
            <input type="text" id="boletim-num-${sectionId}-${boletimId}" placeholder="Digite o número do boletim" ${notGeneratedCheckbox.checked ? 'disabled' : ''}>
            <button class="remove-boletim-btn" onclick="removeBoletimField('${sectionId}', ${boletimId})">–</button>
        </div>
    `;
    notGeneratedCheckbox.parentElement.insertAdjacentHTML('beforebegin', newBoletimField);
    updateBoletimFields(sectionId);
}

function removeBoletimField(sectionId, boletimIdx) {
    const boletimField = document.getElementById(`boletim-field-${sectionId}-${boletimIdx}`);
    if (boletimField) boletimField.remove();
    updateBoletimFields(sectionId);
}

function handleActivityChange(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const selectedOptions = Array.from(section.querySelectorAll(`input[name="option-${sectionId}"]:checked`)).map(input => input.value);
    
    const isDefesaCivil = selectedOptions.includes("OCORRÊNCIA DEFESA CIVIL");
    const existingDefesaCivilGroup = section.querySelector(`#defesa-civil-group-${sectionId}`);
    
    if (isDefesaCivil && !existingDefesaCivilGroup) {
        const defesaCivilHTML = `
            <div id="defesa-civil-group-${sectionId}" class="defesa-civil-group">
                <div class="form-group">
                    <label>Tipo de Ocorrência:</label>
                    <div class="radio-group">
                        ${defesaCivilTipos.map(tipo => `
                            <div class="radio-option">
                                <input type="radio" id="tipo-${sectionId}-${tipo.toLowerCase()}" name="tipo-${sectionId}" value="${tipo}">
                                <label for="tipo-${sectionId}-${tipo.toLowerCase()}">${tipo}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="form-group">
                    <label>Ocorrência:</label>
                    <div class="checkbox-list">
                        ${defesaCivilOcorrencias.map(ocorrencia => `
                            <div class="checkbox-group">
                                <input type="checkbox" id="ocorrencia-${sectionId}-${ocorrencia.toLowerCase().replace(/\s+/g, '-')}" name="ocorrencia-${sectionId}" value="${ocorrencia}">
                                <label for="ocorrencia-${sectionId}-${ocorrencia.toLowerCase().replace(/\s+/g, '-')}">${ocorrencia}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="form-group">
                    <label for="protocolo-${sectionId}">Número do Protocolo:</label>
                    <input type="text" id="protocolo-${sectionId}" placeholder="Digite o número do protocolo">
                </div>
            </div>
        `;
        const lastFormGroup = section.querySelector('.form-group:last-of-type');
        if (lastFormGroup) lastFormGroup.insertAdjacentHTML('afterend', defesaCivilHTML);
    } else if (!isDefesaCivil && existingDefesaCivilGroup) {
        existingDefesaCivilGroup.remove();
    }
    
    const existingBoletimGroup = section.querySelector(`#boletim-group-${sectionId}`);
    if (existingBoletimGroup && !selectedOptions.includes("ACIONAMENTO DA GTT")) {
        existingBoletimGroup.remove();
    } else if (selectedOptions.includes("ACIONAMENTO DA GTT") && !existingBoletimGroup) {
        const boletimHTML = `
            <div id="boletim-group-${sectionId}" class="boletim-group">
                <div class="form-group boletim-field" id="boletim-field-${sectionId}-0">
                    <label for="boletim-num-${sectionId}-0">Número do Boletim de Ocorrência de Trânsito:</label>
                    <input type="text" id="boletim-num-${sectionId}-0" placeholder="Digite o número do boletim">
                    <button class="add-boletim-btn" onclick="addBoletimField('${sectionId}')">+</button>
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="not-generated-${sectionId}" name="not-generated-${sectionId}">
                    <label for="not-generated-${sectionId}">Não gerado</label>
                </div>
            </div>
        `;
        const outcomeField = section.querySelector(`[for="outcome-${sectionId}"]`)?.parentElement;
        if (outcomeField) outcomeField.insertAdjacentHTML('afterend', boletimHTML);
        const notGeneratedCheckbox = document.getElementById(`not-generated-${sectionId}`);
        if (notGeneratedCheckbox) {
            notGeneratedCheckbox.addEventListener('change', () => updateBoletimFields(sectionId));
        }
    }
}

function askRemoveSection(sectionId) {
    sectionToRemove = sectionId;
    const modal = document.getElementById('confirmationModal');
    if (modal) modal.style.display = 'block';
}

function confirmRemoval() {
    if (sectionToRemove) {
        const sectionElement = document.getElementById(sectionToRemove);
        if (sectionElement) {
            const previousDivider = sectionElement.previousElementSibling;
            if (previousDivider && previousDivider.classList.contains('divider')) {
                previousDivider.remove();
            }
            sectionElement.remove();
        }
        sectionToRemove = null;
        updateOccurrences();
        updateAddButtonPosition();
    }
    closeModal();
}

function closeModal() {
    const modal = document.getElementById('confirmationModal');
    if (modal) modal.style.display = 'none';
}

// Função para verificar se uma seção tem dados válidos (não está vazia)
function isValidSection(section) {
    const sectionId = section.id;
    const options = Array.from(section.querySelectorAll(`input[name="option-${sectionId}"]:checked`)).length;
    const camerasSel = Array.from(section.querySelectorAll(`input[name="camera-${sectionId}"]:checked`)).length;
    const location = section.querySelector(`#location-${sectionId}`)?.value.trim() || '';
    const time = section.querySelector(`input[id^="time"]`)?.value.trim() || '';
    const comments = section.querySelector('textarea[id^="comments"]')?.value.trim() || '';
    
    // Considera seção válida se tiver pelo menos uma opção selecionada OU local OU horário OU descrição
    return (options > 0 || camerasSel > 0 || location !== '' || time !== '' || comments !== '');
}

function saveReport() {
    const responsible = document.getElementById("responsible")?.value.trim() || '';
    const reportDate = document.getElementById("report-date")?.value.trim() || '';
    const sections = Array.from(document.querySelectorAll('.form-section'));

    // Remover seções vazias antes de salvar
    const validSections = sections.filter(section => isValidSection(section));
    
    // Se após filtrar não houver seções válidas, não salvar
    if (validSections.length === 0) {
        alert("Não é possível salvar um relatório vazio. Adicione informações em pelo menos uma ocorrência.");
        return;
    }

    const reportData = {
        responsible: responsible,
        reportDate: reportDate,
        sections: validSections.map(section => {
            const sectionId = section.id;
            const defesaCivilData = section.querySelector(`#defesa-civil-group-${sectionId}`) ? {
                tipo: section.querySelector(`input[name="tipo-${sectionId}"]:checked`)?.value || '',
                ocorrencias: Array.from(section.querySelectorAll(`input[name="ocorrencia-${sectionId}"]:checked`)).map(input => input.value),
                protocolo: section.querySelector(`#protocolo-${sectionId}`)?.value || ''
            } : null;

            return {
                options: Array.from(section.querySelectorAll(`input[name="option-${sectionId}"]:checked`)).map(input => input.value),
                cameras: Array.from(section.querySelectorAll(`input[name="camera-${sectionId}"]:checked`)).map(input => input.value),
                location: section.querySelector(`#location-${sectionId}`)?.value || '',
                time: section.querySelector('input[id^="time"]')?.value || '',
                comments: section.querySelector('textarea[id^="comments"]')?.value || '',
                outcome: section.querySelector('textarea[id^="outcome"]')?.value || '',
                boletins: Array.from(section.querySelectorAll(`#boletim-group-${sectionId} input[type="text"]`)).map(input => input.value).filter(Boolean),
                notGenerated: section.querySelector(`#not-generated-${sectionId}`)?.checked || false,
                images: Array.from(section.querySelectorAll(`.image-preview`)).map(img => img.src).filter(src => src),
                defesaCivil: defesaCivilData
            };
        })
    };

    let fileDate;
    if (reportDate && validateDateFormat(reportDate)) {
        fileDate = reportDate.replace(/\//g, '-');
    } else {
        const now = new Date();
        fileDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
    }

    const fileName = `relatorio_coi_${fileDate}.json`;
    const jsonBlob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(jsonBlob);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
    alert("Relatório salvo com sucesso!");
}

function loadSingleReport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const sectionsContainer = document.getElementById('sections-container');
    if (sectionsContainer) sectionsContainer.innerHTML = '';
    uniqueId = 0; 
    boletimId = 0;
    imageId = 0;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const reportData = JSON.parse(e.target.result);
            const responsibleInput = document.getElementById('responsible');
            const reportDateInput = document.getElementById('report-date');
            if (responsibleInput) responsibleInput.value = reportData.responsible || '';
            if (reportDateInput) reportDateInput.value = reportData.reportDate || '';
            if (reportData.sections && reportData.sections.length > 0) {
                reportData.sections.forEach(section => addSection(section));
            }
            updateOccurrences();
            updateAddButtonPosition();
            alert("Relatório carregado com sucesso!");
        } catch (err) {
            console.error("Erro ao carregar relatório:", err);
            alert("Erro ao carregar o relatório.");
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function triggerMonthlyReportLoad() {
    const input = document.getElementById('load-monthly-files');
    if (input) {
        input.value = '';
        input.click();
    }
}

function generatePDF() {
    console.log("Iniciando generatePDF");
    if (!window.jspdf || !window.jspdf.jsPDF) {
        console.error("jsPDF não carregado");
        alert("Erro: Biblioteca jsPDF não carregada. Verifique sua conexão ou a inclusão do script.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    const lineHeight = 10;
    const fontSize = 10;
    let y = margin;
    let pageNumber = 1;

    function addHeader() {
        doc.setFont("courier", "italic");
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`CENTRAL DE OPERAÇÕES E INTELIGÊNCIA - COI (pág. ${String(pageNumber).padStart(2, '0')})`, pageWidth / 2, 5, { align: 'center' });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(fontSize);
        doc.setTextColor(0, 0, 0);
    }

    function checkSpace(requiredHeight) {
        if (y + requiredHeight > pageHeight - margin) {
            doc.addPage();
            pageNumber++;
            y = margin;
            addHeader();
        }
    }

    const responsibleInput = document.getElementById("responsible");
    const reportDateInput = document.getElementById("report-date");
    const responsible = responsibleInput?.value.trim() || '';
    const reportDate = reportDateInput?.value.trim() || '';
    let sections = Array.from(document.querySelectorAll('.form-section'));

    if (!responsibleInput || !reportDateInput) {
        console.error("Elementos DOM não encontrados: responsible ou report-date");
        alert("Erro: Campos do formulário não encontrados. Verifique a estrutura HTML.");
        return;
    }

    if (!responsible) {
        alert("Preencha o nome do responsável pelo plantão.");
        responsibleInput.focus();
        return;
    }
    if (!reportDate || !validateDateFormat(reportDate)) {
        alert("A data do relatório deve estar no formato DD/MM/YYYY e ser válida.");
        reportDateInput.focus();
        return;
    }
    
    // Filtrar seções vazias
    const validSections = sections.filter(section => isValidSection(section));
    if (validSections.length === 0) {
        alert("Adicione pelo menos uma ocorrência com informações válidas.");
        return;
    }

    for (let i = 0; i < validSections.length; i++) {
        const section = validSections[i];
        const sectionId = section.id;
        const options = Array.from(section.querySelectorAll(`input[name="option-${sectionId}"]:checked`)).map(input => input.value);
        const camerasSel = Array.from(section.querySelectorAll(`input[name="camera-${sectionId}"]:checked`)).map(input => input.value);
        const timeInput = section.querySelector(`input[id^="time"]`);
        const commentsInput = section.querySelector('textarea[id^="comments"]');
        const time = timeInput?.value.trim() || '';
        const comments = commentsInput?.value.trim() || '';

        if (!options.length) {
            alert(`Na Ocorrência ${String(i + 1).padStart(2, '0')}: Selecione pelo menos uma atividade.`);
            return;
        }
        if (!camerasSel.length) {
            alert(`Na Ocorrência ${String(i + 1).padStart(2, '0')}: Selecione pelo menos uma câmera.`);
            return;
        }
        if (!time || !validateTimeFormat(time)) {
            alert(`Na Ocorrência ${String(i + 1).padStart(2, '0')}: O horário deve estar no formato HH:MM (ex.: 23:00 ou 02:00 para próxima madrugada).`);
            timeInput?.focus();
            return;
        }
        if (!comments) {
            alert(`Na Ocorrência ${String(i + 1).padStart(2, '0')}: Preencha a descrição.`);
            commentsInput?.focus();
            return;
        }
    }

    validSections.sort((a, b) => {
        const timeA = a.querySelector('input[id^="time"]')?.value.trim() || '23:59';
        const timeB = b.querySelector('input[id^="time"]')?.value.trim() || '23:59';
        if (isNextDayTime(timeA) === isNextDayTime(timeB)) {
            return timeToMinutes(timeA) - timeToMinutes(timeB);
        }
        return isNextDayTime(timeA) ? 1 : -1;
    });

    addHeader();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("RELATÓRIO DIÁRIO - COI", pageWidth / 2, y, { align: 'center' });
    y += 12;

    checkSpace(lineHeight * 2);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Nome do Responsável:", 10, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    const responsibleLines = doc.splitTextToSize(responsible, 120);
    doc.text(responsibleLines[0], 60, y);
    if (responsibleLines.length > 1) {
        y += lineHeight;
        for (let i = 1; i < responsibleLines.length; i++) {
            checkSpace(lineHeight);
            doc.text(responsibleLines[i], 60, y);
            y += lineHeight;
        }
    }
    y += 5;

    checkSpace(lineHeight * 2);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Data do Relatório:", 10, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    doc.text(reportDate, 60, y);
    y += 10;

    validSections.forEach((section, index) => {
        const sectionId = section.id;
        const options = Array.from(section.querySelectorAll(`input[name="option-${sectionId}"]:checked`)).map(input => activities.find(a => a.replace(/^\d+\.\s/, '') === input.value) || input.value);
        const camerasSel = Array.from(section.querySelectorAll(`input[name="camera-${sectionId}"]:checked`)).map(input => input.value);
        const location = section.querySelector(`#location-${sectionId}`)?.value || 'Não informado';
        const time = section.querySelector(`input[id^="time"]`)?.value || 'Não informado';
        const comments = section.querySelector('textarea[id^="comments"]')?.value || 'Não informado';
        const outcome = section.querySelector('textarea[id^="outcome"]')?.value || 'Não informado';
        const boletins = Array.from(section.querySelectorAll(`#boletim-group-${sectionId} input[type="text"]`)).map(input => input.value).filter(Boolean);
        const notGenerated = section.querySelector(`#not-generated-${sectionId}`)?.checked || false;
        const images = Array.from(section.querySelectorAll(`.image-preview`)).map(img => img.src).filter(src => src);

        const isDefesaCivil = options.some(opt => opt.includes("OCORRÊNCIA DEFESA CIVIL"));
        if (isDefesaCivil) {
            const defesaCivilGroup = section.querySelector(`#defesa-civil-group-${section.id}`);
            if (defesaCivilGroup) {
                const tipo = defesaCivilGroup.querySelector(`input[name="tipo-${section.id}"]:checked`)?.value || 'Não informado';
                const ocorrencias = Array.from(defesaCivilGroup.querySelectorAll(`input[name="ocorrencia-${section.id}"]:checked`)).map(input => input.value).join('; ') || 'Não informado';
                const protocolo = defesaCivilGroup.querySelector(`#protocolo-${section.id}`)?.value || 'Não informado';

                doc.setDrawColor(255,165,0);
                doc.setLineWidth(0.5);
                doc.line(15, y, pageWidth - 15, y);
                y += 5;

                checkSpace(lineHeight * 4);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.text('Defesa Civil:', 10, y);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(fontSize);
                
                doc.text(`• Tipo: ${tipo}`, 20, y + lineHeight);
                doc.text(`• Ocorrências: ${ocorrencias}`, 20, y + lineHeight * 2);
                doc.text(`• Protocolo: ${protocolo}`, 20, y + lineHeight * 3);
                
                y += lineHeight * 4;
            }
        }
        
        checkSpace(lineHeight * 3);
        doc.line(10, y, pageWidth - 10, y);
        y += 5;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(`Ocorrência ${(index + 1).toString().padStart(2, '0')}`, pageWidth / 2, y, { align: 'center' });
        y += 8;

        checkSpace(options.length * lineHeight);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text('Atividade Observada:', 10, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(fontSize);
        let activityY = y;
        options.forEach((opt, i) => {
            const lines = doc.splitTextToSize(opt, 110);
            lines.forEach((line, j) => {
                checkSpace(lineHeight);
                doc.text(line, 60, activityY + (i * lineHeight) + (j * lineHeight));
            });
        });
        y = activityY + Math.max(options.length, 1) * lineHeight + 5;

        if (options.some(opt => opt.includes("ACIONAMENTO DA GTT"))) {
            const boletimText = notGenerated ? "Não gerado" : boletins.length ? boletins.join("; ") : "Não informado";
            const boletimLines = doc.splitTextToSize(boletimText, 80);
            checkSpace(lineHeight * (boletimLines.length + 1));
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text('Boletim de Ocorrência:', 10, y);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(fontSize);
            doc.text(boletimLines[0], 110, y);
            if (boletimLines.length > 1) {
                y += 8;
                for (let i = 1; i < boletimLines.length; i++) {
                    checkSpace(lineHeight);
                    doc.text(boletimLines[i], 110, y);
                    y += 8;
                }
            }
            y += 5;
        }

        checkSpace(camerasSel.length * lineHeight);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text('Câmeras:', 10, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(fontSize);
        let cameraY = y;
        camerasSel.forEach((cam, i) => {
            const camLines = doc.splitTextToSize(cam, 110);
            camLines.forEach((line, j) => {
                checkSpace(lineHeight);
                doc.text(line, 60, cameraY + (i * lineHeight) + (j * lineHeight));
            });
        });
        y = cameraY + Math.max(camerasSel.length, 1) * lineHeight + 5;

        if (images.length > 0) {
            checkSpace(65 * Math.ceil(images.length / 2));
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text('Imagens:', 10, y);
            y += 7;
            for (let i = 0; i < images.length; i += 2) {
                try {
                    doc.addImage(images[i], 'JPEG', 20, y, 80, 60);
                    if (i + 1 < images.length) {
                        doc.addImage(images[i + 1], 'JPEG', 110, y, 80, 60);
                    }
                    y += 65;
                } catch (err) {
                    console.error(`Erro ao adicionar imagem ${i + 1}:`, err);
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(fontSize);
                    doc.text(`Erro ao carregar imagem ${i + 1}`, 20, y);
                    y += 10;
                }
            }
        }

        checkSpace(lineHeight * 2);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text('Local:', 10, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(fontSize);
        const locationLines = doc.splitTextToSize(location, 110);
        doc.text(locationLines[0], 60, y);
        if (locationLines.length > 1) {
            y += lineHeight;
            for (let i = 1; i < locationLines.length; i++) {
                checkSpace(lineHeight);
                doc.text(locationLines[i], 60, y);
                y += lineHeight;
            }
        }
        y += 10;

        checkSpace(lineHeight * 2);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text('Horário:', 10, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(fontSize);
        const timeText = isNextDayTime(time) ? `${time} (dia seguinte)` : time;
        doc.text(timeText, 60, y);
        y += 10;

        const descLines = doc.splitTextToSize(comments, 110);
        checkSpace(lineHeight * (descLines.length + 1));
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text('Descrição:', 10, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(fontSize);
        doc.text(descLines[0], 60, y);
        if (descLines.length > 1) {
            y += 5;
            for (let i = 1; i < descLines.length; i++) {
                checkSpace(lineHeight);
                doc.text(descLines[i], 60, y);
                y += 5;
            }
        }
        y += 10;

        const outcomeLines = doc.splitTextToSize(outcome, 110);
        checkSpace(lineHeight * (outcomeLines.length + 1));
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text('Desfecho:', 10, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(fontSize);
        doc.text(outcomeLines[0], 60, y);
        if (outcomeLines.length > 1) {
            y += 5;
            for (let i = 1; i < outcomeLines.length; i++) {
                checkSpace(lineHeight);
                doc.text(outcomeLines[i], 60, y);
                y += 5;
            }
        }
        y += 10;
    });

    const now = new Date();
    const timestamp = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} às ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    checkSpace(lineHeight * 2);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(fontSize);
    doc.text(`Arquivo gerado em: ${timestamp}`, pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.text("Prefeitura do Cabo de Santo Agostinho. Gerência de Inteligência - COI", pageWidth / 2, y, { align: 'center' });

    try {
        const fileDate = reportDate.replace(/\//g, '-');
        doc.save(`relatorio_coi_${fileDate}.pdf`);
    } catch (error) {
        console.error("Erro ao salvar PDF:", error);
        alert("Ocorreu um erro ao salvar o PDF. Verifique o console para mais detalhes.");
    }
}

function generateMonthlyPDF(event) {
    const files = event.target.files;
    if (!files || files.length === 0) {
        alert("Nenhum arquivo selecionado.");
        return;
    }

    const loadedReports = [];
    let filesProcessed = 0;

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const reportData = JSON.parse(e.target.result);
                if (reportData.reportDate && validateDateFormat(reportData.reportDate)) {
                    loadedReports.push(reportData);
                } else {
                    console.warn(`Arquivo ${file.name} ignorado: data inválida ou ausente.`);
                }
            } catch (err) {
                console.error(`Erro ao processar o arquivo ${file.name}:`, err);
            }
            filesProcessed++;
            if (filesProcessed === files.length) {
                if (loadedReports.length === 0) {
                    alert("Nenhum relatório válido foi carregado. Verifique os arquivos selecionados.");
                    return;
                }
                generateMonthlyPDFContent(loadedReports);
            }
        };
        reader.onerror = function() {
            console.error(`Erro ao ler o arquivo ${file.name}`);
            filesProcessed++;
            if (filesProcessed === files.length) {
                if (loadedReports.length === 0) {
                    alert("Nenhum relatório válido foi carregado. Verifique os arquivos selecionados.");
                    return;
                }
                generateMonthlyPDFContent(loadedReports);
            }
        };
        reader.readAsText(file);
    });
}

function generateMonthlyPDFContent(loadedReports) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    const lineHeight = 10;
    const fontSize = 10;
    let y = margin;
    let pageNumber = 1;

    function addHeader() {
        doc.setFont("courier", "italic");
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`CENTRAL DE OPERAÇÕES E INTELIGÊNCIA - COI (pág. ${String(pageNumber).padStart(2, '0')})`, pageWidth / 2, 5, { align: 'center' });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(fontSize);
        doc.setTextColor(0, 0, 0);
    }

    function checkSpace(requiredHeight) {
        if (y + requiredHeight > pageHeight - margin) {
            doc.addPage();
            pageNumber++;
            y = margin;
            addHeader();
        }
    }

    addHeader();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("RELATÓRIO MENSAL - COI", pageWidth / 2, y, { align: 'center' });
    y += 12;

    const reportsByMonth = {};
    loadedReports.forEach(report => {
        const [day, month, year] = report.reportDate.split('/');
        const monthYear = `${month}/${year}`;
        reportsByMonth[monthYear] = reportsByMonth[monthYear] || [];
        const sortedSections = report.sections.sort((a, b) => {
            const timeA = a.time || '23:59';
            const timeB = b.time || '23:59';
            if (isNextDayTime(timeA) === isNextDayTime(timeB)) {
                return timeToMinutes(timeA) - timeToMinutes(timeB);
            }
            return isNextDayTime(timeA) ? 1 : -1;
        });
        reportsByMonth[monthYear].push({ ...report, sections: sortedSections });
    });

    const sortedMonths = Object.keys(reportsByMonth).sort((a, b) => a.localeCompare(b));
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    sortedMonths.forEach((monthYear, index) => {
        if (index > 0) {
            doc.addPage();
            pageNumber++;
            y = margin;
            addHeader();
        }
        const [month, year] = monthYear.split('/').map(Number);
        checkSpace(lineHeight * 2);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(`Relatórios de ${monthNames[month - 1]} de ${year}`, 10, y);
        y += 10;

        const reports = reportsByMonth[monthYear].sort((a, b) => a.reportDate.localeCompare(b.reportDate));
        reports.forEach((report, reportIdx) => {
            checkSpace(lineHeight * 4);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text(`Relatório do dia ${report.reportDate}`, 10, y);
            y += 8;

            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text("Responsável:", 10, y);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(fontSize);
            const responsibleLines = doc.splitTextToSize(report.responsible || 'Não informado', 120);
            doc.text(responsibleLines[0], 60, y);
            if (responsibleLines.length > 1) {
                y += lineHeight;
                for (let i = 1; i < responsibleLines.length; i++) {
                    checkSpace(lineHeight);
                    doc.text(responsibleLines[i], 60, y);
                    y += lineHeight;
                }
            }
            y += 5;

            report.sections.forEach((section, sectionIdx) => {
                checkSpace(lineHeight * 3);
                doc.line(10, y, pageWidth - 10, y);
                y += 5;
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.text(`Ocorrência ${(sectionIdx + 1).toString().padStart(2, '0')}`, pageWidth / 2, y, { align: 'center' });
                y += 8;

                const options = section.options.map(opt => activities.find(a => a.replace(/^\d+\.\s/, '') === opt) || opt);
                checkSpace(options.length * lineHeight);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.text('Atividade Observada:', 10, y);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(fontSize);
                let activityY = y;
                options.forEach((opt, i) => {
                    const lines = doc.splitTextToSize(opt, 110);
                    lines.forEach((line, j) => {
                        checkSpace(lineHeight);
                        doc.text(line, 60, activityY + (i * lineHeight) + (j * lineHeight));
                    });
                });
                y = activityY + Math.max(options.length, 1) * lineHeight + 5;

                if (section.defesaCivil) {
                    const tipo = section.defesaCivil.tipo || 'Não informado';
                    const ocorrencias = section.defesaCivil.ocorrencias?.join('; ') || 'Não informado';
                    const protocolo = section.defesaCivil.protocolo || 'Não informado';

                    doc.setDrawColor(255,165,0);
                    doc.setLineWidth(0.5);
                    doc.line(15, y, pageWidth - 15, y);
                    y += 5;
                
                    checkSpace(lineHeight * 4);
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(12);
                    doc.text('Defesa Civil:', 10, y);
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(fontSize);
                    
                    doc.text(`• Tipo: ${tipo}`, 20, y + lineHeight);
                    doc.text(`• Ocorrências: ${ocorrencias}`, 20, y + lineHeight * 2);
                    doc.text(`• Protocolo: ${protocolo}`, 20, y + lineHeight * 3);
                    
                    y += lineHeight * 4;
                }

                if (section.options.some(opt => opt.includes("ACIONAMENTO DA GTT"))) {
                    const boletimText = section.notGenerated ? "Não gerado" : section.boletins.length ? section.boletins.join("; ") : "Não informado";
                    const boletimLines = doc.splitTextToSize(boletimText, 80);
                    checkSpace(lineHeight * (boletimLines.length + 1));
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(12);
                    doc.text('Boletim de Ocorrência:', 10, y);
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(fontSize);
                    doc.text(boletimLines[0], 110, y);
                    if (boletimLines.length > 1) {
                        y += 8;
                        for (let i = 1; i < boletimLines.length; i++) {
                            checkSpace(lineHeight);
                            doc.text(boletimLines[i], 110, y);
                            y += 8;
                        }
                    }
                    y += 5;
                }

                checkSpace(section.cameras.length * lineHeight);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.text('Câmeras:', 10, y);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(fontSize);
                let cameraY = y;
                section.cameras.forEach((cam, i) => {
                    const camLines = doc.splitTextToSize(cam, 110);
                    camLines.forEach((line, j) => {
                        checkSpace(lineHeight);
                        doc.text(line, 60, cameraY + (i * lineHeight) + (j * lineHeight));
                    });
                });
                y = cameraY + Math.max(section.cameras.length, 1) * lineHeight + 5;

                if (section.images && section.images.length > 0) {
                    checkSpace(65 * Math.ceil(section.images.length / 2));
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(12);
                    doc.text('Imagens:', 10, y);
                    y += 7;
                    for (let i = 0; i < section.images.length; i += 2) {
                        try {
                            doc.addImage(section.images[i], 'JPEG', 20, y, 80, 60);
                            if (i + 1 < section.images.length) {
                                doc.addImage(section.images[i + 1], 'JPEG', 110, y, 80, 60);
                            }
                            y += 65;
                        } catch (err) {
                            console.error(`Erro ao adicionar imagem ${i + 1} ao PDF:`, err);
                            doc.setFont("helvetica", "normal");
                            doc.setFontSize(fontSize);
                            doc.text(`Erro ao carregar imagem ${i + 1}`, 20, y);
                            y += 10;
                        }
                    }
                }

                checkSpace(lineHeight * 2);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.text('Local:', 10, y);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(fontSize);
                const locationLines = doc.splitTextToSize(section.location || 'Não informado', 110);
                doc.text(locationLines[0], 60, y);
                if (locationLines.length > 1) {
                    y += lineHeight;
                    for (let i = 1; i < locationLines.length; i++) {
                        checkSpace(lineHeight);
                        doc.text(locationLines[i], 60, y);
                        y += lineHeight;
                    }
                }
                y += 10;

                checkSpace(lineHeight * 2);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.text('Horário:', 10, y);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(fontSize);
                const timeText = isNextDayTime(section.time) ? `${section.time} (dia seguinte)` : section.time || 'Não informado';
                doc.text(timeText, 60, y);
                y += 10;

                const descLines = doc.splitTextToSize(section.comments || 'Não informado', 110);
                checkSpace(lineHeight * (descLines.length + 1));
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.text('Descrição:', 10, y);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(fontSize);
                doc.text(descLines[0], 60, y);
                if (descLines.length > 1) {
                    y += 5;
                    for (let i = 1; i < descLines.length; i++) {
                        checkSpace(lineHeight);
                        doc.text(descLines[i], 60, y);
                        y += 5;
                    }
                }
                y += 10;

                const outcomeLines = doc.splitTextToSize(section.outcome || 'Não informado', 110);
                checkSpace(lineHeight * (outcomeLines.length + 1));
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.text('Desfecho:', 10, y);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(fontSize);
                doc.text(outcomeLines[0], 60, y);
                if (outcomeLines.length > 1) {
                    y += 4;
                    for (let i = 1; i < outcomeLines.length; i++) {
                        checkSpace(lineHeight);
                        doc.text(outcomeLines[i], 60, y);
                        y += 4;
                    }
                }
                y += 10;
            });
        });
    });

    const now = new Date();
    const timestamp = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} às ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    checkSpace(lineHeight * 2);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(fontSize);
    doc.text(`Arquivo gerado em: ${timestamp}`, pageWidth / 2, y, { align: 'center' });
    y += 10;
    doc.text("Prefeitura do Cabo de Santo Agostinho. Gerência de Inteligência - COI", pageWidth / 2, y, { align: 'center' });

    try {
        const [month, year] = sortedMonths[0].split('/'); 
        doc.save(`relatorio_mensal_coi_${year}-${month.padStart(2, '0')}.pdf`);
        alert("PDF Mensal gerado com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar PDF:", error);
        alert("Ocorreu um erro ao salvar o PDF. Verifique o console para mais detalhes.");
    }
}

function exportToExcel() {
    const responsible = document.getElementById("responsible")?.value.trim() || '';
    const reportDate = document.getElementById("report-date")?.value.trim() || '';
    let sections = Array.from(document.querySelectorAll('.form-section'));

    if (!responsible) {
        alert("Preencha o nome do responsável pelo plantão.");
        return;
    }
    if (!reportDate || !validateDateFormat(reportDate)) {
        alert("A data do relatório deve estar no formato DD/MM/YYYY e ser válida.");
        return;
    }
    
    const validSections = sections.filter(section => isValidSection(section));
    if (validSections.length === 0) {
        alert("Adicione pelo menos uma ocorrência com informações válidas.");
        return;
    }

    validSections.sort((a, b) => {
        const timeA = a.querySelector('input[id^="time"]')?.value.trim();
        const timeB = b.querySelector('input[id^="time"]')?.value.trim();
        
        if (isNextDayTime(timeA) === isNextDayTime(timeB)) {
            return timeToMinutes(timeA) - timeToMinutes(timeB);
        }
        if (isNextDayTime(timeA)) return 1;
        return -1;
    });

    const data = [
        ["RELATÓRIO DIÁRIO - COI"],
        ["Nome do Responsável pelo Plantão:", responsible],
        ["Data do Relatório:", reportDate],
        []
    ];

    validSections.forEach((section, index) => {
        const options = Array.from(section.querySelectorAll(`input[name="option-${section.id}"]:checked`))
            .map(input => activities.find(a => a.replace(/^\d+\.\s/, '') === input.value) || input.value);
        const camerasSel = Array.from(section.querySelectorAll(`input[name="camera-${section.id}"]:checked`))
            .map(input => input.value);
        const location = section.querySelector(`#location-${section.id}`)?.value || '';
        const time = section.querySelector('input[id^="time"]')?.value || '';
        const comments = section.querySelector('textarea[id^="comments"]')?.value || '';
        const outcome = section.querySelector('textarea[id^="outcome"]')?.value || '';
        const boletins = Array.from(section.querySelectorAll(`#boletim-group-${section.id} input[type="text"]`))
            .map(input => input.value).filter(Boolean);
        const notGenerated = section.querySelector(`#not-generated-${section.id}`)?.checked || false;

        data.push([`Ocorrência ${(index + 1).toString().padStart(2, '0')}`]);
        data.push(["Atividade Observada:", options.join("; ")]);
        if (options.some(opt => opt.includes("ACIONAMENTO DA GTT"))) {
            const boletimText = notGenerated ? "Não gerado" : boletins.length ? boletins.join("; ") : "Não informado";
            data.push(["Número do Boletim de Ocorrência de Trânsito:", boletimText]);
        }
        data.push(["Câmeras:", camerasSel.join("; ")]);
        data.push(["Local:", location || 'Não informado']);
        data.push(["Horário:", isNextDayTime(time) ? `${time} (dia seguinte)` : time]);
        data.push(["Descrição:", comments]);
        data.push(["Desfecho:", outcome || 'Não informado']);
        data.push([]);

        const isDefesaCivil = options.some(opt => opt.includes("OCORRÊNCIA DEFESA CIVIL"));
        if (isDefesaCivil) {
            const defesaCivilGroup = section.querySelector(`#defesa-civil-group-${section.id}`);
            if (defesaCivilGroup) {
                const tipo = defesaCivilGroup.querySelector(`input[name="tipo-${section.id}"]:checked`)?.value || 'Não informado';
                const ocorrencias = Array.from(defesaCivilGroup.querySelectorAll(`input[name="ocorrencia-${section.id}"]:checked`)).map(input => input.value).join('; ') || 'Não informado';
                const protocolo = defesaCivilGroup.querySelector(`#protocolo-${section.id}`)?.value || 'Não informado';
                
                data.push(["Tipo de Ocorrência (Defesa Civil):", tipo]);
                data.push(["Ocorrências (Defesa Civil):", ocorrencias]);
                data.push(["Protocolo (Defesa Civil):", protocolo]);
            }
        }
    });

    const now = new Date();
    const timestamp = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} às ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    data.push(["Arquivo gerado em:", timestamp]);
    data.push(["Prefeitura do Cabo de Santo Agostinho. Gerência de Inteligência - COI"]);

    try {
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Relatório COI");

        const fileDate = reportDate.replace(/\//g, '-');
        XLSX.writeFile(wb, `relatorio_coi_${fileDate}.xlsx`);
        alert("Excel exportado com sucesso!");
    } catch (error) {
        console.error("Erro ao exportar para Excel:", error);
        alert("Ocorreu um erro ao exportar para Excel. Verifique o console para mais detalhes.");
    }
}

// ========== DARK MODE ==========
function loadDarkModePreference() {
    const savedMode = localStorage.getItem('darkMode');
    const isDarkMode = savedMode === 'true';
    document.body.classList.toggle('dark-mode', isDarkMode);
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) darkModeToggle.checked = isDarkMode;
    
    const brasao = document.getElementById('brasao-coi');
    if (brasao) {
        brasao.src = isDarkMode 
            ? 'https://i.postimg.cc/gc4J2ByG/brasao-coi2.png' 
            : 'https://i.postimg.cc/pLBkYpqC/brasao-coi-transparente.png';
    }
}

function toggleDarkMode() {
    const isDarkMode = !document.body.classList.contains('dark-mode');
    document.body.classList.toggle('dark-mode', isDarkMode);
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) darkModeToggle.checked = isDarkMode;
    localStorage.setItem('darkMode', isDarkMode);
    
    const brasao = document.getElementById('brasao-coi');
    if (brasao) {
        brasao.src = isDarkMode 
            ? 'https://i.postimg.cc/gc4J2ByG/brasao-coi2.png' 
            : 'https://i.postimg.cc/pLBkYpqC/brasao-coi-transparente.png';
    }
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    loadDarkModePreference();
    const reportDateInput = document.getElementById('report-date');
    if (reportDateInput) applyDateMask(reportDateInput);
    updateAddButtonPosition();
    
    const generatePdfBtn = document.getElementById('generatePdfBtn');
    if (generatePdfBtn) generatePdfBtn.addEventListener('click', generatePDF);
    
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) darkModeToggle.addEventListener('change', toggleDarkMode);
    
    const exportExcelBtn = document.querySelector('.export-excel-btn');
    if (exportExcelBtn) exportExcelBtn.addEventListener('click', exportToExcel);
    
    const saveReportBtn = document.querySelector('.save-report-btn');
    if (saveReportBtn) saveReportBtn.addEventListener('click', saveReport);
    
    const loadReportBtn = document.querySelector('.load-report-btn');
    if (loadReportBtn) loadReportBtn.addEventListener('click', () => {
        const loadFile = document.getElementById('load-file');
        if (loadFile) loadFile.click();
    });
    
    const loadFile = document.getElementById('load-file');
    if (loadFile) loadFile.addEventListener('change', loadSingleReport);
    
    const loadMonthlyFiles = document.getElementById('load-monthly-files');
    if (loadMonthlyFiles) loadMonthlyFiles.addEventListener('change', generateMonthlyPDF);
    
    const confirmBtn = document.querySelector('.confirm-btn');
    if (confirmBtn) confirmBtn.addEventListener('click', confirmRemoval);
    
    const cancelBtn = document.querySelector('.cancel-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Back to top button
    const backToTopButton = document.createElement('div');
    backToTopButton.className = 'back-to-top';
    backToTopButton.innerHTML = '↑';
    backToTopButton.title = 'Voltar ao topo';
    document.body.appendChild(backToTopButton);
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});