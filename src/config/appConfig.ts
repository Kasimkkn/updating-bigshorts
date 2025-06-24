export class AppConfig {
  private readonly height!: number;
  private readonly width!: number;
  private readonly size!: { width: number; height: number; };

  constructor() {
    if (typeof window !== 'undefined') {

      this.size = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      this.height = this.size.height / 100.0;
      this.width = this.size.width / 100.0;
    }
  }
  deviceSize(): { width: number, height: number } {
    return this.size;
  }

  //use only for calculating element's dimensions, not for positioning
  deviceHeight(v: number, parentHeight?: number): number {
    if (parentHeight) {
      return (v / 100) * parentHeight;
    }
    return this.height * v;
  }

  deviceWidth(v: number, parentWidth?: number): number {
    if (parentWidth) {
      return (v / 100) * parentWidth;
    }
    return this.width * v;
  }

  //calculate elements position based on scaling from element's original dimensions and calculated dimensions
  calculatedTop(v: number, calculatedHeight?: number, originalHeight?: number): number {
    if (calculatedHeight && originalHeight) {
      const scale = calculatedHeight / originalHeight;
      return v*scale;
    }
    return this.height * v;
  }

  calculatedLeft(v: number, calculatedWidth?: number, originalWidth?: number): number {
    if (calculatedWidth && originalWidth) {
      const scale = calculatedWidth / originalWidth;
      return v*scale;
    }
    return this.width * v;
  }

  checkPosition(
    top: number,
    left: number,
    elementWidth: number,
    elementHeight: number,
    parentWidth: number,
    parentHeight: number
  ): { top: number, left: number } {
    let newTop = Math.min(top, parentHeight - elementHeight)//prevents overflow bottom
    newTop = Math.max(newTop, 0); ////prevents overflow top

    let newLeft = Math.min(left, parentWidth - elementWidth); //prevents overflow right
    newLeft = Math.max(newLeft, 0);  //prevents overflow left

    return { top: newTop, left: newLeft};
  }
}
