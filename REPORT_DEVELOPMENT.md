# Professional research report — phased development

## Objective

Build an original DS Financial report suitable for a professional decision-making audience. Use a 25–35-page working range, not a page-count guarantee. Length follows the evidence and analytical questions. The existing eight-page valuation brief remains a separate output.

## Phase 1 — Editorial architecture and research record

Deliverables: report mandate, section-by-section analytical questions, evidence records, source dates, reporting scope, unit conventions, and a data-availability assessment. Separate historical actuals, forecasts, assumptions, calculations and analyst interpretation.

Acceptance: source references resolve; historical periods and units are explicit; a forecast cannot be labelled as an actual; unsupported company claims are identified. The first company and primary audience must be selected before company-specific research is finalised.

## Phase 2 — Company research and historical reconstruction

Use company filings, investor presentations, exchange disclosures and other attributable primary evidence. Reconcile at least three annual periods of income statements, balance sheets and cash flow statements. Record consolidated versus standalone scope. Reconcile debt, cash and diluted shares. Research business segments, geography, competitive position, industry economics and management priorities.

Acceptance: every material factual claim has a source and locator; figures reconcile to statements; unavailable evidence is documented. Provider data is not automatically treated as audited or licensed for redistribution.

## Phase 3 — Analytical development

Develop business drivers, historical growth and margin bridges, cash conversion, reinvestment, capital structure, explicit forecasts, WACC, DCF, independently sourced comparable valuations, downside/base/upside cases, valuation sensitivities, and risks. Use an appropriate methodology for the business; do not apply an industrial FCFF model to a bank without explaining the limitation.

Acceptance: statements reconcile; forecast assumptions have rationale; scenarios have explicit shocks; no invented target price, confidence percentage, peer multiple, market size or qualitative recommendation.

## Phase 4 — Professional report and working model

Build a long-form editorial report with a cover, contents, executive conclusions, evidence-led chapters, numbered exhibits, source notes and appendix. Use narrative paragraphs alongside charts and tables. Headlines should express the supported conclusion. The Excel model supplies traceable calculations rather than duplicating presentation tables.

Acceptance: readable text at normal scale; consistent navigation, typography, colours, tables and number formats; automatic pagination; exhibit and source references resolve; spreadsheet inputs, formulas and outputs are distinguishable.

## Phase 5 — Verification and editorial review

Reopen exports, compare report figures to workbook results, render and inspect every PDF page, inspect workbook layout, check negative/zero/missing-data cases, and review the narrative for unsupported claims and repetition. Review the website workflow independently of export tests.

Acceptance: no clipped or overlapping content; no broken formulas or dangling references; complete provenance; unresolved analytical limitations disclosed; actual website interactions verified separately.

## Working report architecture (approximately 30 pages)

1. Cover and mandate
2. Contents and reading guide
3–4. Executive summary and decision implications
5–7. Company, business model and segment economics
8–10. Industry, competitive position and strategic context
11–14. Historical performance, profitability and cash conversion
15–17. Forecast assumptions, operating drivers and reinvestment
18–21. Cost of capital, DCF, market cross-checks and value bridge
22–24. Scenarios, sensitivities and risk assessment
25–26. Value creation priorities and diligence workplan
27–30. Detailed statements, methodology, sources and limitations

Do not fill missing chapters with generic prose or repeat exhibits to reach the working length. A missing source is a research task, not an invitation to invent content.

## Current status

- Existing: eight-page brief, linked Excel model and calculation tests.
- Phase 1 implemented: editorial architecture, evidence record, source/period/unit checks and Research brief workspace.
- Phase 2 in progress: Company sources workspace, provider directory, separate Tata Motors issuer identities, official filing references and dated Yahoo market references.
- Data-access limit observed: Tata CV annual-report downloads returned HTTP 403; a direct NSE filing download timed out. No annual statements were invented or marked extracted.
- First validation case: Tata Motors; primary audience: investment committee / equity investor.
- Tata Motors requires explicit selection between TMCV (commercial vehicles) and TMPV (passenger vehicles / JLR), reflecting the October 2025 demerger.
- Not complete: company-specific research, full professional report, workbook visual review and website visual review.

## Workspace redraft — 31 October 2026

The primary modelling page now uses a modular calculation engine and a seven-step research workflow: overview, company/sources, historical financials, forecast assumptions, DCF valuation, scenarios/sensitivity and report studio. The former page is preserved as `financial-modelling-advanced.html` for specialist legacy models and in `_dev/financial-modelling-legacy.html`.

New workflow capabilities: sourced annual-period entry with balance-sheet reconciliation; explicit transfer of reviewed revenue and EBITDA margin to forecast inputs; editable D&A, capex and working-capital assumptions; component-based WACC builder; browser-local valuation; saved/importable projects; dated market-reference provenance; stale-output protection; and linked report/Excel exports. The unlevered model does not invent a levered net-income forecast or tax benefits on operating losses.

Verification: DOM workflow tests cover all seven views, input validation, saving, stale exports and actual-period reconciliation. Independent engine checks cover valuation equivalence and editable reinvestment. Browser visual review and the complete company-specific 25–35-page research report remain outstanding; neither is represented as complete.


## Decision Lab release — 31 October 2026
Implemented and published on ds-financial.onrender.com/financial-modelling.html#decision: bounded reverse DCF for constant growth and EBITDA margin, user-weighted scenarios, margin-of-safety entry ceiling, six-driver sensitivity ranking, thesis and invalidation notes, and model fragility flags. Settings travel with version 2 projects; older projects restore defaults. Excel exports include an additional DecisionLab sheet. The existing eight-page PDF brief does not yet include these new exhibits.

Validation: 30 tool tests passed, including root recovery, unreachable targets, zero weights, invalid weight totals, stale-result blocking, project restoration and Excel round trip. 364 production asset checks passed. Render release a3d4b5f92e8933b8c6ec16f5ab25189da3336c54 is live; browser checks confirmed reverse-DCF values and all six driver rows. Existing research, cloud-sync and sector-model limitations remain open.


## Upload & forecast release — 31 October 2026
Implemented browser-local English OCR (self-hosted Tesseract worker, WASM and language data), PDF text extraction with scanned-page fallback, XLSX/CSV/TXT reading, SHA-256 source IDs and cell-level evidence, editable period grids, explicit year/unit selection, conflict/missing-figure review, and mandatory review before applying. Eleven metrics seed the FCFF model. A separate aggregate three-statement forecast reconciles assets/liabilities/equity and cash, models interest on opening debt and debt draws for cash shortfalls, and exports a LinkedStatements sheet. Records and opening balances travel in portable projects.

Live price panel fetches dated INR Yahoo references, requires same-entity confirmation, retains source/timestamp and recalculates without replacing share count. TCS quote retrieved on live UI with an exchange timestamp; delayed/cached data remains explicitly labelled.

Validation: 36 tests pass; 370 asset checks pass. Synthetic scanned-image OCR and text-PDF extraction each mapped all 33 sample figures in actual engines. CSV import/review/forecast, historical provenance, balance-sheet/funding checks, restore and entity-confirmed quote application are covered. Browser upload automation was blocked by extension file-URL permissions, so interactive browser file/OCR completion remains unverified. No user permission settings were changed.

Limits: English OCR, INR units, rule-based annual labels, one to five year columns, six files at 25 MB each and up to 20 selected PDF pages. Complex or unmatched labels remain manual; no claim of universal document extraction or audited accuracy. Forecast is aggregate and excludes dividends, repayments, disposals, new equity and detailed statutory schedules. Research PDF remains the existing brief; linked statements are in the UI and Excel, not the PDF. Project storage remains on-device.


## Three intake routes — 31 October 2026
Published Data & forecast offers direct manual annual financial entry, a typed versioned Excel template with company/scope/currency/units/year metadata, and one-click listed-company available-data packs. Templates preserve blanks and reject formulas/text in numeric cells. Public packs align P&L/BS/CF by exact annual period; equity is capital plus reserves and debt-side liabilities exclude equity. Cash/capex are not inferred. Packs include raw provider tables, dated quote and discovered exchange annual-report references, not guaranteed copies of PDF contents.

Validation: 39 tool tests, 130 backend tests and 374 asset checks pass. A real TCS pack produced three FY2024-FY2026 periods, seven workbook sheets, ten exchange annual-report references and six explicitly missing cash/capex fields; Excel serialisation/reimport passed. Live browser manual entry generated five linked years with reconciled balance-sheet checks. Existing browser file-upload automation permission limitation remains. Source data is secondary standalone; complete audited extraction and all-unlisted-company coverage are not claimed.


## Model revision and committee memo — 31 October 2026
Added Compare & memo: named calculated baseline snapshots, same-company/scope guards, exact ordered input-replacement valuation bridge, and user-authored decision/catalyst/diligence notes. Baselines and notes travel with project JSON/save/restore. Excel gets CommitteeNotes and, when pinned, VersionComparison sheets. The editable Markdown memo combines the current snapshot, thesis, scenarios, comparison, data gaps and source register. It is explicitly a working memo rather than completed company research; the existing PDF brief is separate. Stored quote metadata is distinguished from any manually edited market reference.

Validation: 42 tool tests and 376 asset checks pass. Tests cover multi-driver bridge reconciliation, WACC/terminal-growth transition validity, company/scope mismatch, stale inputs, notes/project restore, Excel sheets and memo evidence boundaries. Live browser comparison moved an illustrative model from INR 16.56 to INR 21.87, attributing INR 1.47 to early growth and INR 3.84 to margin. Live memo creation returned success. Project storage remains on-device and full report/editorial research remains outstanding.
