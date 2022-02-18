module.exports = class NoteDto {
  id: string;
  title: string;
  content: string;
  isPrivate: boolean;
  updatedAt: string;
  labels: string[];

  constructor(note: any, labels: string[]) {
    this.id = note.id;
    this.title = note.title;
    this.content = note.content;
    this.isPrivate = note.isPrivate;
    this.updatedAt = note.updatedAt;
    this.labels = [...labels];
  }
};
