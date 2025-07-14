import { BaseComponent } from "@/src/core/components/baseComponent";
import { Page } from "@playwright/test";

export class ContentEditorComponent extends BaseComponent {
    constructor(page: Page) {
        super(page);
    }
}