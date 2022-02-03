import TokenService from './token-service';
import {where} from "sequelize";

const db = require('../models');
const NoteModel = db.Note;
const LabelModel = db.Label;
const NoteLabelModel = db.NoteLabel;
const tokenService = new TokenService();
const ApiError = require('../exeptions/api-error');
const NoteDto = require('../dtos/note-dto');

class NoteService{
    // async getLabels(noteId: number){
    //     let labels: string[] = [];
    //     let labelIds = await NoteLabelModel.findAll({where: { NoteId: noteId}});
    //     labelIds = labelIds.map((labelId: any) => labelId.get().LabelId);
    //     for (const labelId of labelIds) {
    //         let label = await LabelModel.findOne({where: {id: labelId}});
    //         label = label.get().title;
    //         labels.push(label);
    //     }
    //
    //     return labels
    // }

    async createUniqueLabels(userId: number, noteId: number, labels: string[]){
        //getting all user labels
        let allLabels = await LabelModel.findAll( {where: {userId}});
        //filling junction table NoteLabels
        for (const label of allLabels) {
            await NoteLabelModel.create({
                NoteId: noteId,
                LabelId: label.dataValues.id
            });
        }
        // finding and adding unique labels to table
        allLabels = allLabels.map((label: any) => label.get().title);
        let newLabels: string[] = labels.filter(label => !allLabels.includes(label));
        for (const label of newLabels) {
            await LabelModel.create({title: label, userId});
        }
    }

    async getAllNotes(refreshToken: string){
        if(!refreshToken){
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const notes = await NoteModel.findAll({where: { userId: userData.id}}) // [{Note},{Note},...]

        return notes;
    }

    async createNote(title: string, content: string, isPrivate: boolean, accessToken: string, labels: string[]) {
        //getting user ID
        const userId = tokenService.getIdFromAccessToken(accessToken);
        if(!userId) throw ApiError.UnauthorizedError();
        //creating note & noteDto
        const note = await NoteModel.create({title, content, isPrivate, userId});
        const noteDto = new NoteDto(note.dataValues,labels);
        //getting all user labels
        let allLabels = await LabelModel.findAll( {where: {userId}});
        //filling junction table NoteLabels
        for (const label of allLabels) {
            await NoteLabelModel.create({
                NoteId: note.dataValues.id,
                LabelId: label.dataValues.id
            });
        }
        // finding and adding unique labels to table
        allLabels = allLabels.map((label: any) => label.get().title);
        let newLabels: string[] = labels.filter(label => !allLabels.includes(label));
        for (const label of newLabels) {
            await LabelModel.create({title: label, userId});
        }
        await this.createUniqueLabels(userId, note.dataValues.id, labels);

        return noteDto;
    }

    async getNoteById(noteId: number, accessToken: string){
        // getting user ID
        const userId = tokenService.getIdFromAccessToken(accessToken);
        if(!userId) throw ApiError.UnauthorizedError();
        // getting note
        const note = await NoteModel.findOne({where: {
            id: noteId
        }});
        if(note.get().isPrivate && note.get().userId !== userId) throw ApiError.NoPermission('This is a private note');
        // getting labels
        let labels: string[] = [];
        let labelIds = await NoteLabelModel.findAll({where: { NoteId: noteId}});
        labelIds = labelIds.map((labelId: any) => labelId.get().LabelId);
        for (const labelId of labelIds) {
            let label = await LabelModel.findOne({where: {id: labelId}});
            label = label.get().title;
            labels.push(label);
        }
        const noteDto = new NoteDto(note.dataValues, labels);

        return noteDto
    }

    async updateNote(noteId: number, title: string, content: string, isPrivate: boolean, accessToken: string, labels: string[]){
        const userId = tokenService.getIdFromAccessToken(accessToken);
        if(!userId) throw ApiError.UnauthorizedError();
        // getting note
        const note = await NoteModel.findOne({where: {
            id: noteId
        }});
        if(!note) throw ApiError.BadRequest('Note does not exist');
        if(note.get().userId !== userId) throw ApiError.BadRequest('Permission error');
        // Updating note
        note.title = title;
        note.content = content;
        note.isPrivate = isPrivate;
        await note.save();
        // Destroy old labels
        let labelIds = await NoteLabelModel.findAll({where: { NoteId: noteId}});
        labelIds = labelIds.map((labelId: any) => labelId.get().LabelId);
        for (const labelId of labelIds) {
            await LabelModel.destroy({where: {id: labelId}});
        }
        //create new labels
        await this.createUniqueLabels(userId, noteId, labels);
        const noteDto = new NoteDto(note.dataValues,labels);

        return noteDto
    }

    async deleteNote(accessToken: string, noteId: number){
        const userId = tokenService.getIdFromAccessToken(accessToken);
        if(!userId) throw ApiError.UnauthorizedError();
        await NoteModel.destroy({where: {
            id: noteId,
                userId
        }});
        //get all ids of all labels
        let labelsForDeleting = await NoteLabelModel.findAll({where: { NoteId: noteId}});
        labelsForDeleting = labelsForDeleting.map((labelId: any) => labelId.get().LabelId);
        //removing labels with noteId
        await NoteLabelModel.destroy({where: {
                NoteId: noteId
        }});
        //getting IDs of used labels from NoteLabels table
        let usedLabels: number[] = [];
        for (const labelId of labelsForDeleting) {
            let label = await NoteLabelModel.findOne({where: {LabelId: labelId}});
            label = label.get().id;
            usedLabels.push(label);
        }

        if(usedLabels){
            labelsForDeleting = labelsForDeleting.filter((labelId:number) => !usedLabels.includes(labelId));
            await NoteModel.destroy({where: {id: labelsForDeleting}})
        }

    }
}

export default NoteService;