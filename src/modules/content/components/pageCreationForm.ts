import { BaseComponent } from "@/src/core/components/baseComponent";
import { Locator, Page } from "@playwright/test";
import { ImageUploaderComponent } from "./imageUploader";
import { ContentEditorComponent } from "./contentEditor";
import { AttachementUploaderComponent } from "./attachementUploader";

export class PageCreationFormComponent extends BaseComponent {

    readonly pageTitleInput: Locator;
    readonly contentSummary: Locator;
    readonly imageUploader: ImageUploaderComponent;
    readonly contentEditor: ContentEditorComponent;
    readonly attachementUploader: AttachementUploaderComponent;

    constructor(page: Page) {
        super(page);
        this.pageTitleInput = page.locator("#contentTitle");
        this.contentSummary = page.locator("#contentSummary");
        this.imageUploader = new ImageUploaderComponent(page);
        this.contentEditor = new ContentEditorComponent(page);
        this.attachementUploader = new AttachementUploaderComponent(page);
    }
}