import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { QuestionCard } from './QuestionCard';
import type { FormSection } from '../data/mockFormData';
import type { Theme } from '../themes';

interface SectionProps {
  section: FormSection;
  theme: Theme;
}

export function Section({ section, theme }: SectionProps) {
  const sectionClasses = [
    theme.section.background,
    theme.section.borderRadius,
    theme.section.shadow,
    theme.section.border,
    theme.section.overflow,
  ].filter(Boolean).join(' ');

  const headerClasses = theme.sectionHeader.background;

  const titleClasses = [
    theme.sectionHeader.titleSize,
    theme.sectionHeader.titleColor,
  ].filter(Boolean).join(' ');

  const descriptionClasses = [
    theme.sectionHeader.descriptionSize,
    theme.sectionHeader.descriptionColor,
  ].filter(Boolean).join(' ');

  return (
    <Card className={sectionClasses}>
      <CardHeader className={headerClasses}>
        <CardTitle className={titleClasses}>{section.title}</CardTitle>
        {section.description && (
          <p className={descriptionClasses}>{section.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {section.fields.map((field) => (
            <QuestionCard key={field.id} field={field} theme={theme} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
