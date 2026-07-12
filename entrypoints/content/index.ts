import './content.css';

export default defineContentScript({
	matches: ['https://gemini.google.com/*'],
	main() {
		console.log('Gemini Quick Delete Loaded');

		// 垃圾桶SVG图标
		const TRASH_ICON = `
      <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="20" fill="#1f1f1f">
<path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
      </svg>
    `;

		// 辅助函数：等待元素出现
		const waitForElement = (selector: string, parent: Element | Document = document, timeout = 2000): Promise<Element | null> => {
			return new Promise((resolve) => {
				if (parent.querySelector(selector)) {
					return resolve(parent.querySelector(selector));
				}
				const observer = new MutationObserver(() => {
					if (parent.querySelector(selector)) {
						resolve(parent.querySelector(selector));
						observer.disconnect();
					}
				});
				observer.observe(document.body, { childList: true, subtree: true });
				// 超时处理，防止死等
				setTimeout(() => {
					observer.disconnect();
					resolve(null);
				}, timeout);
			});
		};

		// 执行删除流程
		const handleDelete = async (rowElement: HTMLElement, e: Event) => {
			e.preventDefault();
			e.stopPropagation();

			// 1. 找到该行原生的"更多选项"按钮 (通常是三个点)
			// Gemini 的 DOM 结构会在 button 和 gem-icon-button 之间变化。
			const menuButton = rowElement.querySelector(
				'button[data-test-id="actions-menu-button"], gem-icon-button[data-test-id="actions-menu-button"]',
			) as HTMLElement | null;

			if (!menuButton) {
				console.error('无法找到原生菜单按钮');
				return;
			}

			// 模拟点击菜单按钮
			menuButton.click(); // 有时需要 click() 有时需要 dispatchEvent
			// 如果简单的 click 不生效，可能需要更深层的模拟，但在 Chrome 插件中 click 通常有效

			// 2. 等待弹出菜单出现 (role="menu")
			const menu = await waitForElement('[role="menu"]', document);
			if (!menu) return;

			// 3. 在菜单中找到 "Delete" 或 "删除" 选项
			// 这里支持多种语言，建议根据实际情况添加更多语言支持
			// 菜单项通常是 role="menuitem"
			const deleteOption = document.querySelector('button[data-test-id="delete-button"]') as HTMLButtonElement
			if (deleteOption) {
				deleteOption.click();
			} else {
				console.error('未找到删除选项，请检查语言设置');
				return; // 退出，避免误操作
			}

			// 4. 等待确认弹窗 (role="dialog" 或 "alertdialog")
			const dialog = await waitForElement('[role="alertdialog"], [role="dialog"]');
			if (!dialog) return;

			// 5. 点击确认按钮
			// 当前 Gemini 将 cdkfocusinitial 放在 Delete 按钮的 gem-button 容器上，
			// 真正可点击的是容器内部的原生 button。
			const confirmButton =
				dialog.querySelector<HTMLButtonElement>(
					[
						'mat-dialog-actions button[cdkfocusinitial]:not([disabled])',
						'mat-dialog-actions [cdkfocusinitial] button:not([disabled])',
					].join(', '),
				) ??
				Array.from(
					dialog.querySelectorAll<HTMLButtonElement>('mat-dialog-actions button:not([disabled])'),
				).find((button) => {
					const text = button.textContent?.replace(/\s+/g, ' ').trim().toLowerCase();
					return text === 'delete' || text === '删除';
				});

			if (!confirmButton) {
				console.error('未找到删除确认按钮，请检查弹窗 DOM');
				return;
			}

			confirmButton.click();
		};

		// 处理单个对话行
		const processRow = (row: HTMLElement) => {
			if (row.dataset.wxtDeleteAttached) return; // 避免重复添加
			row.dataset.wxtDeleteAttached = 'true';

			// 创建按钮
			const btn = document.createElement('button');
			btn.className = 'wxt-quick-delete-btn';
			btn.innerHTML = TRASH_ICON;

			// 绑定点击事件
			btn.addEventListener('click', (e) => handleDelete(row, e));

			// 插入按钮
			// 我们需要将按钮插入到 row 内部，最好是 append 到底部，通过 CSS absolute 定位
			row.style.position = 'relative'; // 确保父元素是定位基准
			row.appendChild(btn);
		};

		// 主循环：监听侧边栏变化
		const observer = new MutationObserver((mutations) => {
			// 查找所有的对话链接/行
			// Gemini 侧边栏的对话通常是 <a href="/app/..."> 或特定 class
			// 选择器可能需要根据 Gemini 更新进行微调
			const chatRows = document.querySelectorAll('conversations-list gem-nav-list-item');
			chatRows.forEach((row) => {
				processRow(row as HTMLElement);
			});
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	},
});
