declare module "@sibevin/random-token" {
  export namespace RandomToken {
    function gen(options: Record<string, string | number>): string;
  }
  export default RandomToken;
}
