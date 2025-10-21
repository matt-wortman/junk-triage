# Critique of `architecture-FINAL-synthesis.md`

## Key Disagreements

1. **Mutable QuestionDictionary still risks drift**  
   The synthesis keeps historical question wording inside a mutable `QuestionDictionary` row plus a JSON `changeLog` (docs/architecture-FINAL-synthesis.md:85-134). Live answers in `extendedData` read the current row to validate stale state (docs/architecture-FINAL-synthesis.md:320-339). If someone edits the dictionary entry without correctly maintaining `changeLog`, prior prompts disappear and stale detection falls back to `"Unknown"`. A dedicated `QuestionRevision` table with immutable rows (or equivalent FK-backed history) would make referential integrity enforceable; this design still relies on disciplined JSON updates.

2. **“No manual version management” vs. admin-managed version bumps**  
   Success metrics promise “No manual version management” (docs/architecture-FINAL-synthesis.md:807), yet the same doc assigns admins the job of deciding when to increment `versionNumber` (docs/architecture-FINAL-synthesis.md:136-140,839-844). That is manual version management. Either automate the decision or adjust the metric/communication so stakeholders understand the human gating involved.

3. **Stale detection accuracy can’t be 100% without guaranteed history**  
   `getAnswerStatus` looks up the old prompt text from `changeLog` and substitutes `"Unknown"` when absent (docs/architecture-FINAL-synthesis.md:332-335). That undermines the “100% stale answer detection accuracy” metric (docs/architecture-FINAL-synthesis.md:800-804). You need immutable historical records—or at least validated change-log completeness—to make that guarantee.

4. **Performance figures are asserted, not demonstrated**  
   The success metrics list <2s snapshot creation, ~20-byte per-answer overhead, and ~10KB snapshot size (docs/architecture-FINAL-synthesis.md:809-815) without any sizing model or measurement evidence. Present them as targets or assumptions until backed by data.

## Recommendation
Move question/answer history from JSON blobs into immutable revision tables (even if lightweight), clarify that admins own version increments unless you automate them, and restate the performance numbers as goals pending measurement. These adjustments would align the synthesis with its integrity claims and avoid overpromising on UX and reliability.  
