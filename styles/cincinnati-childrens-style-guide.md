# Cincinnati Children's Hospital Medical Center
## Website Design Style Guide

### Version 1.0 | 2025
### Healthcare Sector Design Standards for Pediatric Medical Centers

---

## 1. Brand Overview

### Mission Statement
Cincinnati Children's Hospital Medical Center is dedicated to improving child health and transforming the delivery of care through fully integrated, globally recognized research, education and innovation.

### Brand Values
- **Excellence**: Commitment to being #1 in pediatric care
- **Compassion**: Family-centered care approach
- **Innovation**: Leading-edge research and treatment
- **Trust**: Building confidence with families
- **Accessibility**: Making care available to all children

### Brand Personality
- Professional yet approachable
- Authoritative but warm
- Innovative while reassuring
- Child-friendly without being childish

---

## 2. Color Palette

### Primary Colors

#### Cincinnati Children's Blue
- **Hex**: #0055B8
- **RGB**: 0, 85, 184
- **Usage**: Primary brand color, headers, CTAs, navigation
- **Accessibility**: WCAG AA compliant with white text

#### Cincinnati Children's Light Blue
- **Hex**: #00A9E0
- **RGB**: 0, 169, 224
- **Usage**: Secondary accents, highlights, interactive elements
- **Accessibility**: Requires white text for contrast

### Secondary Colors

#### Warm Gray
- **Hex**: #696969
- **RGB**: 105, 105, 105
- **Usage**: Body text, secondary information

#### Light Gray
- **Hex**: #F5F5F5
- **RGB**: 245, 245, 245
- **Usage**: Backgrounds, section dividers

#### White
- **Hex**: #FFFFFF
- **RGB**: 255, 255, 255
- **Usage**: Primary background, content areas

### Accent Colors (Use Sparingly)

#### Success Green
- **Hex**: #5CB85C
- **RGB**: 92, 184, 92
- **Usage**: Success messages, positive indicators

#### Alert Orange
- **Hex**: #F0AD4E
- **RGB**: 240, 173, 78
- **Usage**: Important notices, warnings

#### Emergency Red
- **Hex**: #D9534F
- **RGB**: 217, 83, 79
- **Usage**: Urgent care alerts, critical information

### Color Usage Guidelines
- Maintain 60-30-10 rule: 60% neutral (white/gray), 30% primary blue, 10% accent
- Ensure all color combinations meet WCAG AA standards
- Use color consistently across all digital properties

---

## 3. Typography

### Font Families

#### Primary Font: Source Sans Pro
- **Headlines**: Source Sans Pro Bold (600-700 weight)
- **Body Text**: Source Sans Pro Regular (400 weight)
- **Fallback**: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif

#### Secondary Font: Georgia (for special content)
- **Usage**: Patient stories, testimonials, quotes
- **Weight**: Regular (400) and Bold (700)
- **Fallback**: 'Times New Roman', serif

### Type Scale

#### Desktop
- **H1**: 48px / Line height: 56px / Bold
- **H2**: 36px / Line height: 44px / Bold
- **H3**: 28px / Line height: 36px / Semi-bold
- **H4**: 24px / Line height: 32px / Semi-bold
- **H5**: 20px / Line height: 28px / Medium
- **Body**: 16px / Line height: 24px / Regular
- **Small**: 14px / Line height: 20px / Regular
- **Caption**: 12px / Line height: 16px / Regular

#### Mobile
- **H1**: 32px / Line height: 40px
- **H2**: 28px / Line height: 36px
- **H3**: 24px / Line height: 32px
- **Body**: 16px / Line height: 24px

### Typography Guidelines
- Maximum line length: 65-75 characters for body text
- Use adequate spacing between paragraphs (1.5x line height)
- Ensure all text meets WCAG AA contrast requirements
- Use sentence case for headlines (capitalize first word only)

---

## 4. Layout & Grid System

### Grid Structure
- **Container Max Width**: 1440px
- **Desktop**: 12-column grid
- **Tablet**: 8-column grid
- **Mobile**: 4-column grid
- **Gutter**: 24px (desktop), 16px (mobile)
- **Margin**: 48px (desktop), 24px (tablet), 16px (mobile)

### Breakpoints
- **Desktop**: 1200px and up
- **Tablet**: 768px - 1199px
- **Mobile**: 767px and below

### Page Sections
1. **Header**: Fixed height 80px (desktop), 60px (mobile)
2. **Hero Section**: 400-600px height with imagery
3. **Content Sections**: Modular blocks with 80px padding
4. **Footer**: Multi-column layout, dark background

---

## 5. UI Components

### Buttons

#### Primary Button
```css
background: #0055B8;
color: #FFFFFF;
padding: 12px 24px;
border-radius: 4px;
font-weight: 600;
font-size: 16px;
transition: all 0.3s ease;
```

#### Secondary Button
```css
background: transparent;
color: #0055B8;
border: 2px solid #0055B8;
padding: 10px 22px;
border-radius: 4px;
```

#### Button States
- **Hover**: Darken by 10%
- **Active**: Darken by 15%
- **Disabled**: 50% opacity
- **Focus**: 3px outline with offset

### Cards

#### Standard Card
```css
background: #FFFFFF;
border: 1px solid #E0E0E0;
border-radius: 8px;
padding: 24px;
box-shadow: 0 2px 4px rgba(0,0,0,0.1);
transition: box-shadow 0.3s ease;
```

#### Hover State
```css
box-shadow: 0 4px 8px rgba(0,0,0,0.15);
```

### Forms

#### Input Fields
```css
border: 1px solid #D0D0D0;
border-radius: 4px;
padding: 12px 16px;
font-size: 16px;
line-height: 24px;
```

#### Focus State
```css
border-color: #0055B8;
outline: 3px solid rgba(0, 85, 184, 0.1);
```

### Navigation

#### Main Navigation
- Horizontal menu on desktop
- Hamburger menu on mobile
- Sticky on scroll
- White background with subtle shadow

#### Breadcrumbs
```
Home > Services > Cardiology > Heart Surgery
```
- Use ">" as separator
- Current page not linked

---

## 6. Imagery & Icons

### Photography Guidelines
- **Focus**: Real patients and families (with consent)
- **Tone**: Warm, hopeful, professional
- **Diversity**: Represent diverse patient population
- **Quality**: High-resolution, professional photography
- **Avoid**: Stock photos that feel generic

### Image Treatment
- Maintain natural colors (avoid heavy filters)
- Use subtle overlays for text legibility
- Ensure proper alt text for accessibility

### Icon Style
- **Style**: Line icons, 2px stroke weight
- **Color**: Match primary blue or section color
- **Size**: 24px, 32px, 48px standard sizes
- **Library**: Use consistent icon set (e.g., Feather Icons)

---

## 7. Content Guidelines

### Voice & Tone
- **Professional**: Medical accuracy is paramount
- **Compassionate**: Show empathy for families
- **Clear**: Avoid medical jargon when possible
- **Reassuring**: Provide hope while being honest

### Content Structure
1. **Headlines**: Clear, benefit-focused
2. **Introductions**: Brief, scannable
3. **Body Content**: Break into digestible sections
4. **Calls-to-Action**: Clear, action-oriented

### Writing Style
- Use active voice
- Write at 8th-grade reading level for patient content
- Define medical terms when used
- Include clear next steps

---

## 8. Accessibility Standards

### WCAG 2.1 AA Compliance
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Focus Indicators**: Visible focus states for all interactive elements

### Additional Requirements
- **Alt Text**: Descriptive alt text for all images
- **Video Captions**: Closed captions for all video content
- **Form Labels**: Clear, associated labels for all form fields
- **Error Messages**: Clear, specific error guidance

---

## 9. Responsive Design

### Mobile-First Approach
- Design for mobile screens first
- Progressive enhancement for larger screens
- Touch-friendly interface elements (minimum 44x44px)

### Responsive Images
```html
<picture>
  <source media="(min-width: 1200px)" srcset="large.jpg">
  <source media="(min-width: 768px)" srcset="medium.jpg">
  <img src="small.jpg" alt="Description">
</picture>
```

### Performance Guidelines
- Optimize images (WebP format when supported)
- Lazy load below-the-fold content
- Minimize JavaScript bundle size
- Target < 3 second load time

---

## 10. Special Considerations for Healthcare

### HIPAA Compliance
- Never display patient information without authentication
- Use secure forms for sensitive data
- Include privacy policy links prominently

### Emergency Information
- Emergency contact information always visible
- Clear distinction between emergency and non-emergency care
- Quick access to urgent care wait times

### Trust Signals
- Display credentials and certifications
- Show rankings and awards (e.g., US News #1)
- Include physician profiles with credentials
- Feature patient testimonials (with consent)

### Multi-Language Support
- Offer Spanish translation at minimum
- Language selector in header
- Consider cultural sensitivities in imagery

---

## 11. Component Library

### Alert Banners
```html
<div class="alert alert-info">
  <strong>COVID-19 Update:</strong> 
  Current visitor guidelines and safety protocols
</div>
```

### Location Cards
```html
<div class="location-card">
  <h3>Burnet Campus</h3>
  <p>3333 Burnet Avenue, Cincinnati, OH 45229</p>
  <a href="#" class="btn-directions">Get Directions</a>
</div>
```

### Provider Cards
```html
<div class="provider-card">
  <img src="doctor.jpg" alt="Dr. Name">
  <h4>Doctor Name, MD</h4>
  <p>Specialty</p>
  <a href="#" class="btn-profile">View Profile</a>
</div>
```

---

## 12. Implementation Checklist

### Pre-Launch
- [ ] Accessibility audit completed
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness verified
- [ ] Performance metrics meet targets
- [ ] Content reviewed for accuracy
- [ ] Legal/compliance review completed

### Post-Launch
- [ ] Analytics tracking verified
- [ ] Form submissions tested
- [ ] Search functionality working
- [ ] Emergency information accessible
- [ ] Language translations accurate

---

## 13. Maintenance & Updates

### Regular Reviews
- Quarterly: Review analytics and user feedback
- Annually: Update photography and testimonials
- As needed: Update medical information and services

### Version Control
- Document all style guide changes
- Maintain backwards compatibility
- Communicate changes to all stakeholders

---

## Contact & Resources

### Style Guide Maintenance
For questions or updates to this style guide, contact:
- Marketing Department
- Digital Team
- Brand Management

### Additional Resources
- [Logo Files and Assets]
- [Photography Library]
- [Icon Library]
- [Template Library]
- [Component Code Snippets]

---

*This style guide is a living document and should be updated regularly to reflect the evolving needs of Cincinnati Children's Hospital Medical Center and its digital presence.*

*Last Updated: 2025*
*Version: 1.0*
