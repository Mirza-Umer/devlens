import { Controller, Post, Body } from '@nestjs/common';
import { ScannerService } from './scanner.service';

@Controller('scanner')
export class ScannerController {
  constructor(private readonly scannerService: ScannerService) {}

  // 🔧 MANUAL SCAN TEST
  @Post('scan')
  scan(@Body('path') path: string) {
    return this.scannerService.scan(path);
  }
}
