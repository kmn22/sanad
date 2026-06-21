#!/usr/bin/env python3
"""Render the lawyer audit HTML chart to PNG."""
import asyncio
from playwright.async_api import async_playwright
from pathlib import Path

HTML_PATH = Path('/home/z/my-project/scripts/lawyer_audit/index.html')
OUT_PATH = Path('/home/z/my-project/download/sanad-lawyer-audit.png')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1200, 'height': 900}, device_scale_factor=2)
        page = await context.new_page()
        await page.goto(f'file://{HTML_PATH}')
        await page.wait_for_load_state('networkidle')
        await page.wait_for_timeout(1500)
        height = await page.evaluate("""() => Math.ceil(document.querySelector('.container').getBoundingClientRect().bottom + 60)""")
        await page.set_viewport_size({'width': 1200, 'height': height})
        await page.wait_for_timeout(300)
        await page.screenshot(path=str(OUT_PATH), full_page=True)
        await browser.close()
    print(f'OK: {OUT_PATH}')

asyncio.run(main())
