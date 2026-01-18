/**
 * OG 이미지 생성 스크립트
 * 사용법: node scripts/generate-og-image.mjs
 */

import { createCanvas } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 이미지 크기 (권장 OG 이미지 사이즈)
const WIDTH = 1200;
const HEIGHT = 630;

// 로또 번호 색상
const ballColors = [
  '#fbc400', // 1-10: 노랑
  '#69c8f2', // 11-20: 파랑
  '#ff7272', // 21-30: 빨강
  '#aaa', // 31-40: 회색
  '#b0d840', // 41-45: 초록
];

function getBallColor(num) {
  if (num <= 10) return ballColors[0];
  if (num <= 20) return ballColors[1];
  if (num <= 30) return ballColors[2];
  if (num <= 40) return ballColors[3];
  return ballColors[4];
}

function generateOGImage() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // 배경 그라데이션 (어두운 테마)
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(0.5, '#16213e');
  gradient.addColorStop(1, '#0f0f23');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 배경 장식 (원형 패턴)
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * WIDTH;
    const y = Math.random() * HEIGHT;
    const r = Math.random() * 100 + 20;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = ballColors[i % 5];
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // 메인 타이틀
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 72px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('로또메이커', WIDTH / 2, HEIGHT / 2 - 80);

  // 서브 타이틀
  ctx.fillStyle = '#a0a0a0';
  ctx.font = '36px sans-serif';
  ctx.fillText('무료 로또 번호 생성기', WIDTH / 2, HEIGHT / 2);

  // 로또 번호 공 그리기 (예시 번호)
  const sampleNumbers = [7, 14, 21, 35, 42, 45];
  const ballRadius = 35;
  const startX = WIDTH / 2 - (sampleNumbers.length * ballRadius * 2.5) / 2 + ballRadius;
  const ballY = HEIGHT / 2 + 100;

  sampleNumbers.forEach((num, i) => {
    const x = startX + i * ballRadius * 2.5;

    // 공 그림자
    ctx.beginPath();
    ctx.arc(x + 3, ballY + 3, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();

    // 공 배경
    ctx.beginPath();
    ctx.arc(x, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = getBallColor(num);
    ctx.fill();

    // 공 하이라이트
    const highlightGradient = ctx.createRadialGradient(
      x - ballRadius / 3, ballY - ballRadius / 3, 0,
      x, ballY, ballRadius
    );
    highlightGradient.addColorStop(0, 'rgba(255,255,255,0.4)');
    highlightGradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = highlightGradient;
    ctx.fill();

    // 번호 텍스트
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(num.toString(), x, ballY);
  });

  // URL
  ctx.fillStyle = '#666666';
  ctx.font = '24px sans-serif';
  ctx.fillText('lotto-maker.vercel.app', WIDTH / 2, HEIGHT - 50);

  // 파일 저장
  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(__dirname, '..', 'public', 'og-image.png');
  fs.writeFileSync(outputPath, buffer);

  console.log(`OG 이미지 생성 완료: ${outputPath}`);
  console.log(`크기: ${WIDTH}x${HEIGHT}px`);
}

generateOGImage();
