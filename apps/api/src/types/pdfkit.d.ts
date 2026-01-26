declare module 'pdfkit' {
  interface PDFDocument extends NodeJS.WritableStream {
    new (options?: any): PDFDocument
    fontSize(size: number): this
    fillColor(color: string): this
    text(text: string, options?: any): this
    text(text: string, x?: number, y?: number, options?: any): this
    moveDown(lines?: number): this
    end(): void
    on(event: string, listener: (...args: any[]) => void): this
  }
  const PDFDocument: {
    new (options?: any): PDFDocument
  }
  export = PDFDocument
}
