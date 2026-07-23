import { Occurrence } from "../types";

export function generateOccurrencePDF(item: Occurrence) {
  const popup = window.open("", "_blank");
  if (!popup) {
    alert("Por favor, permita a abertura de janelas pop-up para visualizar o PDF.");
    return;
  }

  const safe = (val?: string | null) =>
    (val || "Não informado").replace(/[&<>'"]/g, (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[char] || char)
    );

  const shortFields = [
    ["Identificação", item.id],
    ["Data e Hora", `${new Date(item.date + "T12:00").toLocaleDateString("pt-BR")} às ${item.time}`],
    ["Setor", item.sector],
    ["Responsável", item.responsible],
    ["Envolvido (Operador)", item.monitor],
    ["Supervisor", item.supervisor],
    ["Processo(s) Envolvido(s)", item.process],
    ["Cliente", item.client],
    ["Número do Bem", item.assetNumber],
    ["Categoria", item.category],
    ["Impacto", item.impact],
    ["Status", item.status],
  ];

  const longFields = [
    ["Descrição objetiva da situação", item.description],
    ["Causa identificada", item.cause],
    ["Impacto observado ou potencial", item.observedImpact],
    ["Ação tomada", item.actionTaken],
    ["Responsável pelo encaminhamento", item.forwardingOwner],
    ["Descrição da resolução", item.resolution],
  ].filter(([, content]) => content && content.trim().length > 0);

  const shortRows = shortFields
    .map(
      ([label, content]) => `
      <div class="field">
        <strong>${safe(label)}</strong>
        <span>${safe(content)}</span>
      </div>`
    )
    .join("");

  const longRows = longFields
    .map(
      ([label, content]) => `
      <section class="note">
        <strong>${safe(label)}</strong>
        <p>${safe(content)}</p>
      </section>`
    )
    .join("");

  popup.document.write(`<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>${safe(item.id)} - Relatório de Ocorrência</title>
  <style>
    @page { size: A4; margin: 15mm; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #1e293b; background: #fff; line-height: 1.5; font-size: 11pt; }
    .document { max-width: 180mm; margin: 0 auto; }
    .header { border-bottom: 3px solid #0739c7; padding-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end; }
    .brand { font-size: 20px; font-weight: 800; color: #0739c7; letter-spacing: -0.5px; }
    .meta { text-align: right; color: #64748b; font-size: 9pt; line-height: 1.4; }
    .title-bar { margin-top: 18px; margin-bottom: 20px; }
    .eyebrow { color: #0739c7; font-size: 8.5pt; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
    h1 { font-size: 22px; margin: 0; color: #0f172a; font-weight: 700; }
    .section-title { margin: 20px 0 8px; color: #0739c7; font-size: 9.5pt; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; }
    .field { padding: 6px 0; border-bottom: 1px dashed #f1f5f9; break-inside: avoid; }
    .field strong, .note strong { display: block; margin-bottom: 3px; color: #475569; font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.3px; }
    .field span, .note p { display: block; color: #0f172a; font-weight: 500; white-space: pre-wrap; margin: 0; }
    .note { padding: 10px 0; border-bottom: 1px solid #f1f5f9; break-inside: avoid; }
    .footer { margin-top: 30px; text-align: center; color: #94a3b8; font-size: 8pt; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <main class="document">
    <header class="header">
      <div class="brand">ACHA Imóveis</div>
      <div class="meta">Monitoramento Operacional<br><strong>${safe(item.id)}</strong></div>
    </header>
    <div class="title-bar">
      <div class="eyebrow">Registro de Ocorrência Operacional</div>
      <h1>${safe(item.category)} - ${safe(item.process)}</h1>
    </div>
    
    <div class="section-title">Informações Gerais</div>
    <section class="grid">${shortRows}</section>
    
    <div class="section-title">Detalhamento e Tratativa</div>
    ${longRows}

    <footer class="footer">
      Documento gerado automaticamente pelo Sistema de Monitoramento Operacional ACHA Imóveis em ${new Date().toLocaleString("pt-BR")}
    </footer>
  </main>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`);
  popup.document.close();
}
