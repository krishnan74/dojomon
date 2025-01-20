class DirectionInput {
    private heldDirections: string[];
    private map: Record<string, string>;
  
    constructor() {
      this.heldDirections = [];
  
      this.map = {
        ArrowUp: "up",
        KeyW: "up",
        ArrowDown: "down",
        KeyS: "down",
        ArrowLeft: "left",
        KeyA: "left",
        ArrowRight: "right",
        KeyD: "right",
      };
    }
  
    get direction(): string | undefined {
      return this.heldDirections[0];
    }
  
    init(): void {
      document.addEventListener("keydown", (e: KeyboardEvent) => {
        const dir = this.map[e.code];
        if (dir && !this.heldDirections.includes(dir)) {
          this.heldDirections.unshift(dir);
          // console.log(this.heldDirections);
        }
      });
  
      document.addEventListener("keyup", (e: KeyboardEvent) => {
        const dir = this.map[e.code];
        const index = this.heldDirections.indexOf(dir);
        if (index > -1) {
          this.heldDirections.splice(index, 1);
          // console.log(this.heldDirections);
        }
      });
    }
  }
  
  export { DirectionInput };
  