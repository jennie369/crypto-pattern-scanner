/**
 * RESPONSIVE AUDIT TOOL
 * Tự động scan và detect responsive issues
 */

export const auditResponsive = () => {
  const issues = [];

  // 1. Check fixed widths
  const fixedWidthElements = document.querySelectorAll('[style*="width:"][style*="px"]');
  fixedWidthElements.forEach(el => {
    const width = el.style.width;
    if (parseInt(width) > 768) {
      issues.push({
        type: 'FIXED_WIDTH',
        element: el.tagName,
        class: el.className,
        width: width,
        location: getElementPath(el)
      });
    }
  });

  // 2. Check overflow issues
  const overflowElements = document.querySelectorAll('*');
  overflowElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width > window.innerWidth) {
      issues.push({
        type: 'OVERFLOW',
        element: el.tagName,
        class: el.className,
        actualWidth: rect.width,
        viewportWidth: window.innerWidth,
        location: getElementPath(el)
      });
    }
  });

  // 3. Check flex/grid containers without wrap
  const flexContainers = document.querySelectorAll('[style*="flex"], [class*="flex"]');
  flexContainers.forEach(el => {
    const computedStyle = window.getComputedStyle(el);
    const flexWrap = computedStyle.flexWrap;

    if (flexWrap === 'nowrap' && el.children.length > 3) {
      issues.push({
        type: 'NO_FLEX_WRAP',
        element: el.tagName,
        class: el.className,
        childCount: el.children.length,
        location: getElementPath(el)
      });
    }
  });

  // 4. Check small font sizes
  const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
  textElements.forEach(el => {
    const fontSize = parseInt(window.getComputedStyle(el).fontSize);
    if (fontSize < 14 && window.innerWidth < 768) {
      issues.push({
        type: 'SMALL_FONT',
        element: el.tagName,
        class: el.className,
        fontSize: fontSize,
        location: getElementPath(el)
      });
    }
  });

  // Generate report
  console.group('📱 RESPONSIVE AUDIT REPORT');
  console.log(`Total Issues Found: ${issues.length}`);
  console.table(issues);
  console.groupEnd();

  return {
    totalIssues: issues.length,
    byType: groupByType(issues),
    details: issues
  };
};

const getElementPath = (el) => {
  const path = [];
  let current = el;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    if (current.id) {
      selector += `#${current.id}`;
    } else if (current.className) {
      selector += `.${current.className.split(' ')[0]}`;
    }
    path.unshift(selector);
    current = current.parentElement;
  }

  return path.join(' > ');
};

const groupByType = (issues) => {
  return issues.reduce((acc, issue) => {
    acc[issue.type] = (acc[issue.type] || 0) + 1;
    return acc;
  }, {});
};

// Auto-run on mobile
if (window.innerWidth < 768) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const report = auditResponsive();
      localStorage.setItem('responsive-audit', JSON.stringify(report));
      console.warn(`🚨 Found ${report.totalIssues} responsive issues.`);
    }, 2000);
  });
}
