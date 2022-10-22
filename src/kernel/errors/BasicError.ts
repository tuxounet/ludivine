export class BasicError extends Error {
  static badQuery(who: string, what: string, which: string): BasicError {
    return new BasicError(400, `entrée ${what} ${which} invalide par ${who}`);
  }

  static notFound(who: string, what: string, which: string): BasicError {
    return new BasicError(
      404,
      `entrée ${what} ${which} introuvable quand demandé par ${who}`
    );
  }

  constructor(readonly code: number, message: string) {
    super(message);
  }
}
