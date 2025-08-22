import mongoose from "mongoose";

const RecordSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    ammount: {
        type: Number,
        required: true
    },
    habitId :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Habit"
    }
});

const Record = mongoose.model("Record", RecordSchema);

export default Record;