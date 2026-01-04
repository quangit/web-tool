export interface DiffItem {
  type: 'unchanged' | 'added' | 'removed';
  left: number | null;
  right: number | null;
  content: string;
  originalContent?: string;
}

export interface DiffStats {
  added: number;
  removed: number;
  unchanged: number;
}

export interface AlignedLine {
  lineNum: number | null;
  content: string;
  type: 'unchanged' | 'added' | 'removed' | 'empty';
}

export interface AlignedDiffResult {
  leftLines: AlignedLine[];
  rightLines: AlignedLine[];
  diff: DiffItem[];
}

export interface CompareOptions {
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
}

/**
 * Longest Common Subsequence (LCS) based diff algorithm
 */
function computeLCS(left: string[], right: string[]): number[][] {
  const m = left.length;
  const n = right.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (left[i - 1] === right[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

/**
 * Backtrack to find the diff
 */
function backtrack(dp: number[][], left: string[], right: string[]): DiffItem[] {
  const diff: DiffItem[] = [];
  let i = left.length;
  let j = right.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && left[i - 1] === right[j - 1]) {
      diff.unshift({ type: 'unchanged', left: i, right: j, content: left[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({ type: 'added', left: null, right: j, content: right[j - 1] });
      j--;
    } else if (i > 0) {
      diff.unshift({ type: 'removed', left: i, right: null, content: left[i - 1] });
      i--;
    }
  }

  return diff;
}

/**
 * Compare two texts and return diff
 */
export function compareTexts(
  leftText: string,
  rightText: string,
  options: CompareOptions = {}
): DiffItem[] {
  let leftLines = leftText.split('\n');
  let rightLines = rightText.split('\n');

  // Apply options
  if (options.ignoreWhitespace) {
    leftLines = leftLines.map((line) => line.trim());
    rightLines = rightLines.map((line) => line.trim());
  }

  if (options.ignoreCase) {
    leftLines = leftLines.map((line) => line.toLowerCase());
    rightLines = rightLines.map((line) => line.toLowerCase());
  }

  // Get original lines for display
  const originalLeft = leftText.split('\n');
  const originalRight = rightText.split('\n');

  const dp = computeLCS(leftLines, rightLines);
  const diff = backtrack(dp, leftLines, rightLines);

  // Map back to original content
  return diff.map((item) => {
    if (item.type === 'unchanged') {
      return {
        ...item,
        originalContent: originalLeft[(item.left as number) - 1],
      };
    } else if (item.type === 'added') {
      return {
        ...item,
        originalContent: originalRight[(item.right as number) - 1],
      };
    } else {
      return {
        ...item,
        originalContent: originalLeft[(item.left as number) - 1],
      };
    }
  });
}

/**
 * Calculate statistics from diff
 */
export function calculateStats(diff: DiffItem[]): DiffStats {
  return diff.reduce(
    (acc, item) => {
      if (item.type === 'added') {
        acc.added++;
      } else if (item.type === 'removed') {
        acc.removed++;
      } else {
        acc.unchanged++;
      }
      return acc;
    },
    { added: 0, removed: 0, unchanged: 0 }
  );
}

/**
 * Create aligned side-by-side diff lines
 * Returns { leftLines: [], rightLines: [] } with matching indices
 */
export function createAlignedDiff(
  leftText: string,
  rightText: string,
  options: CompareOptions = {}
): AlignedDiffResult {
  const leftLines = leftText.split('\n');
  const rightLines = rightText.split('\n');

  let processedLeft = [...leftLines];
  let processedRight = [...rightLines];

  // Apply options for comparison
  if (options.ignoreWhitespace) {
    processedLeft = processedLeft.map((line) => line.trim());
    processedRight = processedRight.map((line) => line.trim());
  }

  if (options.ignoreCase) {
    processedLeft = processedLeft.map((line) => line.toLowerCase());
    processedRight = processedRight.map((line) => line.toLowerCase());
  }

  const dp = computeLCS(processedLeft, processedRight);
  const diff = backtrack(dp, processedLeft, processedRight);

  // Build aligned arrays - each removed gets empty on right, each added gets empty on left
  const alignedLeft: AlignedLine[] = [];
  const alignedRight: AlignedLine[] = [];

  diff.forEach((item) => {
    if (item.type === 'unchanged') {
      alignedLeft.push({
        lineNum: item.left,
        content: leftLines[(item.left as number) - 1],
        type: 'unchanged',
      });
      alignedRight.push({
        lineNum: item.right,
        content: rightLines[(item.right as number) - 1],
        type: 'unchanged',
      });
    } else if (item.type === 'removed') {
      // Each removed line gets an empty row on the right
      alignedLeft.push({
        lineNum: item.left,
        content: leftLines[(item.left as number) - 1],
        type: 'removed',
      });
      alignedRight.push({
        lineNum: null,
        content: '',
        type: 'empty',
      });
    } else if (item.type === 'added') {
      // Each added line gets an empty row on the left
      alignedLeft.push({
        lineNum: null,
        content: '',
        type: 'empty',
      });
      alignedRight.push({
        lineNum: item.right,
        content: rightLines[(item.right as number) - 1],
        type: 'added',
      });
    }
  });

  return { leftLines: alignedLeft, rightLines: alignedRight, diff };
}
