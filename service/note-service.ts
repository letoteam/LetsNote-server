import TokenService from './token-service';
import { Op, where } from 'sequelize';

const db = require('../models');
const NoteModel = db.Note;
const LabelModel = db.Label;
const NoteLabelModel = db.NoteLabel;
const tokenService = new TokenService();
const ApiError = require('../exeptions/api-error');
const NoteDto = require('../dtos/note-dto');

class NoteService {
  async getLabels(noteId: number) {
    let labels: string[] = [];
    let labelIds = await NoteLabelModel.findAll({ where: { NoteId: noteId } });
    labelIds = labelIds.map((labelId: any) => labelId.get().LabelId);
    for (const labelId of labelIds) {
      let label = await LabelModel.findOne({ where: { id: labelId } });
      if(label){
        label = {
          id: label.get().id,
          title: label.get().title,
        };
        labels.push(label);
      }
    }

    return labels;
  }

  async createUniqueLabels(userId: number, noteId: number, labels: string[]) {
    //getting all user labels
    let allLabels = await LabelModel.findAll({ where: { UserId: userId } });
    //filling NoteLabels table
    for (const label of allLabels) {
      await NoteLabelModel.create({
        NoteId: noteId,
        LabelId: label.get().id,
      });
    }
    // finding and adding unique labels to table
    allLabels = allLabels.map((label: any) => label.get().title);
    let newLabels: string[] = labels.filter(
      (label) => !allLabels.includes(label)
    );
    for (const label of newLabels) {
      const newLabel = await LabelModel.create({ title: label, userId });
      await NoteLabelModel.create({
        NoteId: noteId,
        LabelId: newLabel.get().id,
      });
    }
  }

  async getAllNotes(accessToken: string) {
    const userId = tokenService.getIdFromAccessToken(accessToken);
    if (!userId) {
      throw ApiError.UnauthorizedError();
    }
    const notes = await NoteModel.findAll({ where: { userId } }); // [{Note},{Note},...]
    if (!notes) {
      return [];
    }
    let notesDtos = [];
    for (const note of notes) {
      const labels = await this.getLabels(note.get().id);
      const noteDto = new NoteDto(note.dataValues, labels);
      notesDtos.push(noteDto);
    }
    return notesDtos;
  }

  async getAllLabels(accessToken: string) {
    const userId = tokenService.getIdFromAccessToken(accessToken);
    if (!userId) throw ApiError.UnauthorizedError();
    let labels = await LabelModel.findAll({ where: { UserId: userId } });
    if (!labels) return [];
    labels = labels.map((label: any) => {
      return {
        id: label.get().id,
        title: label.get().title,
      };
    });
    return labels;
  }

  async createNote(
    title: string,
    content: string,
    isPrivate: boolean,
    accessToken: string,
    labels: string[]
  ) {
    //getting user ID
    const userId = tokenService.getIdFromAccessToken(accessToken);
    if (!userId) throw ApiError.UnauthorizedError();
    //creating note & noteDto
    const note = await NoteModel.create({
      title,
      content,
      isPrivate,
      UserId: userId,
    });
    await this.createUniqueLabels(userId, note.get().id, labels);
    const labelsArr = await this.getLabels(note.get().id);
    console.log(await this.getLabels(note.get().id));
    const noteDto = new NoteDto(note.dataValues, labelsArr);

    return noteDto;
  }

  async getNoteById(noteId: number, accessToken: string) {
    // getting user ID
    // const userId = tokenService.getIdFromAccessToken(accessToken);
    // if (!userId) throw ApiError.UnauthorizedError();
    // getting note
    const note = await NoteModel.findOne({
      where: {
        id: noteId,
      },
    });
    if (!note) {
      throw ApiError.BadRequest('Note does not exists');
    }
    if (note.get().isPrivate){
      throw ApiError.NoPermission('This is a private note');
    }
    let labels = await this.getLabels(note.id);
    const noteDto = new NoteDto(note.dataValues, labels);

    return noteDto;
  }

  async updateNote(
    noteId: number,
    title: string,
    content: string,
    isPrivate: boolean,
    accessToken: string,
    labels: string[]
  ) {
    const userId = tokenService.getIdFromAccessToken(accessToken);
    if (!userId) throw ApiError.UnauthorizedError();
    // getting note
    const note = await NoteModel.findOne({
      where: {
        id: noteId,
      },
    });
    if (!note) throw ApiError.BadRequest('Note does not exist');
    if (note.get().UserId !== userId)
      throw ApiError.BadRequest('Permission error');
    // Updating note
    note.title = title;
    note.content = content;
    note.isPrivate = isPrivate;
    await note.save();
    // Destroy old labels
    let labelIds = await NoteLabelModel.findAll({ where: { NoteId: noteId } });
    labelIds = labelIds.map((labelId: any) => labelId.get().LabelId);
    for (const labelId of labelIds) {
      await LabelModel.destroy({ where: { id: labelId } });
    }
    // Create new labels
    await this.createUniqueLabels(userId, noteId, labels);
    const labelsArr = await this.getLabels(noteId);
    const noteDto = new NoteDto(note.dataValues, labelsArr);
    return noteDto;
  }

  async togglePrivacy(noteId: number, accessToken: string) {
    if (!noteId) throw ApiError.BadRequest();
    const userId = tokenService.getIdFromAccessToken(accessToken);
    if (!userId) throw ApiError.UnauthorizedError();
    // getting note
    const note = await NoteModel.findOne({
      where: {
        id: noteId,
      },
    });
    if (!note) throw ApiError.BadRequest('Note does not exist');
    if (note.get().UserId !== userId)
      throw ApiError.BadRequest('Permission error');
    //updating privacy
    note.isPrivate = !note.isPrivate;
    await note.save();

    const labels = await this.getLabels(noteId);

    const noteDto = new NoteDto(note.dataValues, labels);
    return noteDto;
  }

  async deleteNote(accessToken: string, noteId: number) {
    const userId = tokenService.getIdFromAccessToken(accessToken);
    if (!userId) throw ApiError.UnauthorizedError();
    const noteToDelete = await NoteModel.findOne({
      where: {
        id: noteId,
      },
    });

    if (!noteToDelete)
      throw ApiError.BadRequest('Note with this ID does not exists');

    if (noteToDelete.userId !== userId)
      throw ApiError.NoPermission('You have no permission to delete this note');

    let labelsForDeleting = await NoteLabelModel.findAll({
      where: { NoteId: noteId },
    });

    //getting IDs of used labels from NoteLabels table
    let usedLabels: number[] = [];
    for (const labelId of labelsForDeleting) {
      let label = await NoteLabelModel.findOne({
        where: { LabelId: labelId.get().LabelId },
      });
      label = label.get().id;
      usedLabels.push(label);
    }

    await noteToDelete.destroy();
    if (usedLabels) {
      labelsForDeleting = labelsForDeleting.filter(
        (labelId: number) => !usedLabels.includes(labelId)
      );
      for (const labelForDeleting of labelsForDeleting) {
        await LabelModel.destroy({
          where: { id: labelForDeleting.dataValues.LabelId },
        });
      }
    }

    return noteId;
  }

  async getPublicNotes(accessToken: string){
    const userId = tokenService.getIdFromAccessToken(accessToken);
    if (!userId) {
      throw ApiError.UnauthorizedError();
    }
    const notes = await NoteModel.findAll({where: {
      [Op.not]: [{UserId: userId}],
      isPrivate: false
    }});
    if (!notes) {
      return [];
    }

    let notesDtos = [];
    for (const note of notes) {
      const labels = await this.getLabels(note.get().id);
      const noteDto = new NoteDto(note.dataValues, labels);
      notesDtos.push(noteDto);
    }
    return notesDtos;

  }

  async getUserNotes(accessToken: string, userId: number){
    // const currentUserId = tokenService.getIdFromAccessToken(accessToken);
    // if(userId === currentUserId){}
    const notes = await NoteModel.findAll({where: {
        UserId: userId,
        isPrivate: false
      }});

    let notesDtos = [];
    for (const note of notes) {
      const labels = await this.getLabels(note.get().id);
      const noteDto = new NoteDto(note.dataValues, labels);
      notesDtos.push(noteDto);
    }
    return notesDtos;
  }
}

export default NoteService;
