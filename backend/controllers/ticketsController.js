const prisma = require('../prisma');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const { emailService } = require('../services/email.service');
const logger = require('../utils/logger');

const isDevelopment = process.env.NODE_ENV === 'development';

function internalError(message, errorCode, error) {
  return new ApiError(
    message,
    500,
    errorCode,
    isDevelopment ? { error: error?.message } : null
  );
}

const createTicket = async (req, res, next) => {
  try {
    const { subject, message } = req.body;
    const userId = req.user.id;

    if (!subject || !message) {
      return next(new ApiError('Subject and message are required', 400, 'VALIDATION_ERROR'));
    }

    if (subject.length > 200) {
      return next(new ApiError('Subject must be under 200 characters', 400, 'VALIDATION_ERROR'));
    }

    if (message.length > 5000) {
      return next(new ApiError('Message must be under 5000 characters', 400, 'VALIDATION_ERROR'));
    }

    const ticket = await prisma.ticket.create({
      data: {
        userId,
        subject: subject.trim(),
        message: message.trim(),
        status: 'OPEN'
      }
    });
    logger.info('tickets.create.success', { ticketId: ticket.id, userId });

    res.status(201).json(ApiResponse.success(ticket, 'Ticket created successfully', 201));
  } catch (error) {
    logger.error('tickets.create.error', { userId: req.user?.id, errorMessage: error?.message });
    next(internalError('Failed to create ticket', 'TICKET_CREATE_FAILED', error));
  }
};

const getTickets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const tickets = await prisma.ticket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(ApiResponse.success(tickets, 'Tickets retrieved successfully', 200));
  } catch (error) {
    logger.error('tickets.list_user.error', { userId: req.user?.id, errorMessage: error?.message });
    next(internalError('Failed to fetch tickets', 'TICKETS_FETCH_FAILED', error));
  }
};

const getAllTickets = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};

    const tickets = await prisma.ticket.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json(ApiResponse.success(tickets, 'Tickets retrieved successfully', 200));
  } catch (error) {
    logger.error('tickets.list_admin.error', { status: req.query?.status, errorMessage: error?.message });
    next(internalError('Failed to fetch tickets', 'TICKETS_FETCH_FAILED', error));
  }
};

const updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return next(new ApiError('Status is required', 400, 'VALIDATION_ERROR'));
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: { status }
    });

    res.json(ApiResponse.success(ticket, 'Ticket updated successfully', 200));
  } catch (error) {
    if (error.code === 'P2025') {
      return next(new ApiError('Ticket not found', 404, 'TICKET_NOT_FOUND'));
    }
    logger.error('tickets.update_status.error', { ticketId: req.params?.id, errorMessage: error?.message });
    next(internalError('Failed to update ticket', 'TICKET_UPDATE_FAILED', error));
  }
};

const replyToTicket = async (req, res, next) => {
  try {
    const { ticketId, reply, status } = req.validatedBody;
    logger.info('tickets.reply.start', { ticketId });

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!ticket) {
      return next(new ApiError('Ticket not found', 404, 'TICKET_NOT_FOUND'));
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        replyMessage: reply.trim(),
        repliedAt: new Date(),
        status: status || 'RESOLVED',
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    logger.info('tickets.reply.updated', { ticketId, status: updatedTicket.status });

    let emailSent = false;
    try {
      await emailService.sendSupportReply({
        userEmail: updatedTicket.user.email,
        userName: updatedTicket.user.name,
        subject: updatedTicket.subject,
        replyMessage: reply.trim(),
      });
      emailSent = true;
      logger.info('tickets.reply.email_sent', { ticketId, email: updatedTicket.user.email });
    } catch (emailError) {
      logger.error('tickets.reply.email_failed', { ticketId, errorMessage: emailError?.message });
    }

    res.json(ApiResponse.success({ ...updatedTicket, emailSent }, 'Reply sent successfully', 200));
  } catch (error) {
    logger.error('tickets.reply.error', { ticketId: req.validatedBody?.ticketId, errorMessage: error?.message });
    next(internalError('Failed to reply to ticket', 'TICKET_REPLY_FAILED', error));
  }
};

module.exports = { createTicket, getTickets, getAllTickets, updateTicketStatus, replyToTicket };
