export interface MenuItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  route: string;
  enabled: boolean;
}
