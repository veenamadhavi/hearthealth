const mongoose = require('mongoose');

const heartReportSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  heartRate: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Normal', 'Warning', 'High Risk'],
    required: true
  },
  explanation: { type: String },
  rppgData: {
    signalQuality: Number,
    processingTime: Number,
    framesAnalyzed: Number
  },
  createdAt: { type: Date, default: Date.now }
});

// Determine status based on BPM
heartReportSchema.statics.classifyHeartRate = function (bpm) {
  if (bpm >= 60 && bpm <= 100) {
    return {
      status: 'Normal',
      explanation: 'Your heart rate is within the normal resting range (60-100 BPM). Keep up your healthy lifestyle!'
    };
  } else if ((bpm >= 50 && bpm < 60) || (bpm > 100 && bpm <= 120)) {
    return {
      status: 'Warning',
      explanation: bpm < 60
        ? 'Your heart rate is slightly low (bradycardia range). Monitor for symptoms like dizziness or fatigue.'
        : 'Your heart rate is elevated. Consider resting and avoiding stimulants. Consult a doctor if persistent.'
    };
  } else {
    return {
      status: 'High Risk',
      explanation: bpm < 50
        ? 'Your heart rate is dangerously low. Please seek immediate medical attention.'
        : 'Your heart rate is dangerously high (tachycardia). Please consult a doctor immediately.'
    };
  }
};

module.exports = mongoose.model('HeartReport', heartReportSchema);
