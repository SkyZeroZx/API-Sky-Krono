export function validRoutes(route: string)  : boolean {
  if (route == '/metrics'|| route == '/health') {
    return false;
  }
  return true;
}
