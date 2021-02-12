class Clients {
  static getAll() {
    return self.clients.matchAll();
  }

  static claim() {
    return self.clients.claim();
  }
}
