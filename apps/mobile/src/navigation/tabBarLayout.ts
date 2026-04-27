export const TAB_BAR_BASE_HEIGHT = 62;

export function getTabBarHeight(bottomInset: number) {
  return TAB_BAR_BASE_HEIGHT + Math.max(bottomInset, 8);
}

export function getScreenBottomPadding(bottomInset: number, extra = 20) {
  return getTabBarHeight(bottomInset) + extra;
}
